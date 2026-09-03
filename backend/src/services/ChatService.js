const Message = require("../models/MessageModel");
const Conversation = require("../models/ConversationModel");
const AIService = require("./AIService");

const CUSTOMER_POPULATE = "username avatar email";
const SENDER_POPULATE = "username avatar email isAdmin";

/**
 * Lấy conversation cố định theo cặp customer + type, hoặc tạo khi gửi tin đầu.
 * Unique index bảo đảm các request đồng thời không tạo ra conversation trùng.
 */
const getOrCreateConversation = async (customerId, type) => {
  try {
    return await Conversation.findOneAndUpdate(
      { customer: customerId, type },
      { $setOnInsert: { customer: customerId, type } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      return Conversation.findOne({ customer: customerId, type });
    }
    throw error;
  }
};

// Hàm dùng chung để trả lịch sử theo thứ tự cũ -> mới và kèm thông tin người gửi.
const getMessagesForConversation = (conversationId) =>
  Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", SENDER_POPULATE)
    .lean();

/** Tải riêng lịch sử AI/support của chính user cùng số tin chưa đọc. */
const getCustomerMessages = async (customerId, type) => {
  const conversation = await Conversation.findOne({ customer: customerId, type })
    .populate("customer", CUSTOMER_POPULATE)
    .lean();

  if (!conversation) {
    return {
      status: "OK",
      message: "Conversation not created",
      data: { conversation: null, messages: [], unreadCount: 0 },
    };
  }

  const [messages, unreadCount] = await Promise.all([
    getMessagesForConversation(conversation._id),
    Message.countDocuments({
      conversationId: conversation._id,
      senderType: { $in: ["admin", "bot", "system"] },
      readByCustomer: false,
    }),
  ]);

  return {
    status: "OK",
    message: "Success",
    data: { conversation, messages, unreadCount },
  };
};

// Đồng bộ bản tóm tắt tin cuối sau mỗi lần ghi Message.
const updateLastMessage = (conversationId, message) =>
  Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: {
      text: message.text,
      sender: message.sender || null,
      senderType: message.senderType,
      createdAt: message.createdAt,
    },
  });

// Socket.IO chỉ phát sự kiện cập nhật; việc ghi tin nhắn luôn đi qua HTTP API.
const emitMessage = (io, room, conversation, message) => {
  if (!io) return;
  io.to(room).emit("chat:message", {
    conversationId: String(conversation._id),
    conversationType: conversation.type,
    message,
  });
};

/** Tạo Message và thiết lập trạng thái đọc ban đầu theo phía gửi. */
const createMessage = async ({ conversationId, sender, senderType, text }) => {
  const message = await Message.create({
    conversationId,
    sender,
    senderType,
    text,
    readByCustomer: senderType === "customer",
    readByAdmin: senderType !== "customer",
  });

  await updateLastMessage(conversationId, message);
  return message.populate("sender", SENDER_POPULATE);
};

/**
 * Gọi Gemini bất đồng bộ với 10 tin AI trước đó và phát câu trả lời cho user.
 * Bot không tự tạo support chat; HANDOVER chỉ hướng người dùng sang tab support.
 */
const createAIReply = async ({
  conversation,
  customerId,
  currentMessageId,
  userMessage,
  io,
}) => {
  try {
    const history = await Message.find({
      conversationId: conversation._id,
      _id: { $ne: currentMessageId },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .sort({ createdAt: 1 })
      .lean();

    let reply = await AIService.chatWithGemini(history, userMessage);
    if (reply.includes("HANDOVER_TO_ADMIN")) {
      reply =
        "Bạn hãy chuyển sang tab Nhân viên hỗ trợ và gửi nội dung cần hỗ trợ nhé.";
    }

    const botMessage = await createMessage({
      conversationId: conversation._id,
      sender: null,
      senderType: "bot",
      text: reply,
    });

    emitMessage(io, `user:${customerId}`, conversation, botMessage);
  } catch (error) {
    console.error("AI reply error:", error);
  }
};

/** Lưu câu hỏi vào AI conversation rồi khởi chạy phản hồi Gemini. */
const sendAIMessage = async (customerId, text, io) => {
  const conversation = await getOrCreateConversation(customerId, "ai");
  const message = await createMessage({
    conversationId: conversation._id,
    sender: customerId,
    senderType: "customer",
    text,
  });

  void createAIReply({
    conversation,
    customerId,
    currentMessageId: message._id,
    userMessage: text,
    io,
  });

  return {
    status: "OK",
    message: "Message sent",
    data: { conversation, message },
  };
};

/** Lấy ID của tối đa 10 tin AI gần nhất để gắn làm ngữ cảnh support. */
const getLatestAIContext = async (customerId) => {
  const aiConversation = await Conversation.findOne({
    customer: customerId,
    type: "ai",
  }).lean();

  if (!aiConversation) return [];

  const messages = await Message.find({ conversationId: aiConversation._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("_id")
    .lean();

  return messages.reverse().map((message) => message._id);
};

/**
 * Lưu tin khách vào support conversation, làm mới ngữ cảnh AI và báo cho
 * toàn bộ Admin có quyền chat. Hàm này tuyệt đối không gọi Gemini.
 */
const sendSupportMessage = async (customerId, text, io) => {
  const [conversation, contextMessages] = await Promise.all([
    getOrCreateConversation(customerId, "support"),
    getLatestAIContext(customerId),
  ]);

  const message = await createMessage({
    conversationId: conversation._id,
    sender: customerId,
    senderType: "customer",
    text,
  });

  await Conversation.findByIdAndUpdate(conversation._id, { contextMessages });
  emitMessage(io, "admins:support", conversation, message);

  return {
    status: "OK",
    message: "Message sent",
    data: { conversation, message },
  };
};

/** Danh sách chỉ gồm support chat, mới hoạt động nhất trước, kèm unread count. */
const getAdminSupportConversations = async () => {
  const conversations = await Conversation.find({ type: "support" })
    .sort({ updatedAt: -1 })
    .populate("customer", CUSTOMER_POPULATE)
    .populate("lastMessage.sender", SENDER_POPULATE)
    .lean();

  const data = await Promise.all(
    conversations.map(async (conversation) => ({
      ...conversation,
      unreadCount: await Message.countDocuments({
        conversationId: conversation._id,
        senderType: "customer",
        readByAdmin: false,
      }),
    }))
  );

  return { status: "OK", message: "Success", data };
};

/** Tải lịch sử support và snapshot ngữ cảnh AI để Admin tham khảo. */
const getAdminSupportMessages = async (conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    type: "support",
  })
    .populate("customer", CUSTOMER_POPULATE)
    .populate({
      path: "contextMessages",
      populate: { path: "sender", select: SENDER_POPULATE },
    })
    .lean();

  if (!conversation) {
    return { status: "ERR", message: "Support conversation not found" };
  }

  const messages = await getMessagesForConversation(conversation._id);
  return {
    status: "OK",
    message: "Success",
    data: {
      conversation,
      messages,
      contextMessages: conversation.contextMessages || [],
    },
  };
};

/** Lưu câu trả lời Admin và phát realtime cho khách lẫn các Admin khác. */
const sendAdminSupportMessage = async (adminId, conversationId, text, io) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    type: "support",
  });

  if (!conversation) {
    return { status: "ERR", message: "Support conversation not found" };
  }

  const message = await createMessage({
    conversationId,
    sender: adminId,
    senderType: "admin",
    text,
  });

  emitMessage(io, `user:${conversation.customer}`, conversation, message);
  emitMessage(io, "admins:support", conversation, message);

  return {
    status: "OK",
    message: "Message sent",
    data: { conversation, message },
  };
};

/**
 * Đánh dấu đã đọc theo vai trò. Khách chỉ được thao tác conversation của mình;
 * Admin chỉ được đánh dấu support conversation, không truy cập AI chat riêng.
 */
const markAsRead = async ({ conversationId, userId, isAdmin }) => {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    return { status: "ERR", message: "Conversation not found" };
  }

  if (isAdmin) {
    if (conversation.type !== "support") {
      return { status: "ERR", message: "Forbidden" };
    }
    await Message.updateMany(
      { conversationId, senderType: "customer", readByAdmin: false },
      { $set: { readByAdmin: true } }
    );
  } else {
    if (String(conversation.customer) !== String(userId)) {
      return { status: "ERR", message: "Forbidden" };
    }
    await Message.updateMany(
      {
        conversationId,
        senderType: { $in: ["admin", "bot", "system"] },
        readByCustomer: false,
      },
      { $set: { readByCustomer: true } }
    );
  }

  return { status: "OK", message: "Marked as read" };
};

module.exports = {
  getCustomerMessages,
  sendAIMessage,
  sendSupportMessage,
  getAdminSupportConversations,
  getAdminSupportMessages,
  sendAdminSupportMessage,
  markAsRead,
};
