const ChatService = require("../services/ChatService");

const getMessages = async (req, res) => {
  try {
    // Lấy ID của người dùng:
    // - Nếu Admin xem tin nhắn của khách (truyền qua params /:id)
    // - Nếu Khách tự xem tin mình (lấy từ token req.user.id)
    const userId = req.params.id || req.user.id;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required",
      });
    }

    // Gọi Service để lấy dữ liệu
    const response = await ChatService.getMessages(userId);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, senderType, images } = req.body;

    if (!senderId || !text) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Missing required fields" });
    }

    // Gọi Service
    const response = await ChatService.createMessage({
      senderId,
      receiverId,
      text,
      senderType,
      images,
      io: req.io,
    });

    // Bắn Socket cho Realtime (Nếu có req.io)
    if (response.status === "OK" && req.io) {
      const newMessage = response.data;
      // Nếu khách gửi -> Bắn cho Admin
      if (senderType === "customer" || senderType === "guest") {
        req.io.to("admin_channel").emit("new_message", newMessage);
      } else {
        // Admin/Bot gửi -> Bắn cho user cụ thể
        req.io.to(receiverId).emit("new_message", newMessage);
      }
    }

    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const response = await ChatService.getAllConversations();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id; // Lấy từ token

    if (!conversationId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Conversation ID required" });
    }

    const response = await ChatService.markAsRead(conversationId, userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getMessages,
  createMessage,
  getAllConversations,
  markAsRead,
};
