const Chat = require("../models/MessageModel");
const Conversation = require("../models/ConversationModel");

// 1. Hàm lấy lịch sử tin nhắn
const getMessages = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm cuộc hội thoại mà user này tham gia
      const conversation = await Conversation.findOne({
        participants: { $in: [userId] }, // paraticipants là mảng vì vậy dùng $in (lý do lưu, mảng để sau này có thể hội thoại nhiều người)
      });

      // Nếu chưa chat bao giờ -> Trả về rỗng
      if (!conversation) {
        return resolve({
          status: "OK",
          message: "No conversation found",
          data: [],
        });
      }

      // Lấy tin nhắn, sắp xếp cũ -> mới
      const messages = await Chat.find({ conversationId: conversation._id })
                .sort({ createdAt: 1 })
                .populate('sender', 'username');

      resolve({
        status: "OK",
        message: "Success",
        data: messages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// 2. Hàm TẠO TIN NHẮN (Dùng chung cho cả Socket và API HTTP)
const createMessage = ({ senderId, receiverId, text, senderType, images }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // LOGIC MỚI: Xác định khách hàng là ai
      // Nếu khách nhắn -> Khách là senderId
      // Nếu Admin nhắn -> Khách là receiverId
      const customerId =
        senderType === "customer" || senderType === "guest"
          ? senderId
          : receiverId;

      // Tìm cuộc hội thoại có chứa ID của khách hàng này
      let conversation = await Conversation.findOne({
        participants: { $in: [customerId] },
      });

      // Nếu chưa có -> Tạo mới (Chỉ lưu ID khách, KHÔNG lưu chữ "ADMIN")
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [customerId],
          status: "bot_handling",
        });
      }

      // Tạo tin nhắn, dùng let vì sau cần gán lại
      let newMessage = await Chat.create({
        conversationId: conversation._id,
        sender: senderId, // User ID thật
        text: text || "",
        senderType: senderType,
        images: images || [],
      });

  
      newMessage = await newMessage.populate("sender", "username"); // Lấy thêm thông tin người gửi để hiển thị
      //populate dùng để lấy thông tin từ một collection khác dựa trên ObjectId

      //Cập nhật lại cuộc hội thoại với tin nhất cuối và trạng thái
      await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    text: text || (images?.length ? '[Hình ảnh]' : ''),
                    sender: senderId,
                    seen: false,
                    createdAt: new Date()
                },
                ...(senderType === 'admin' ? { status: 'active' } : {})
            });

      // Logic thêm Admin vào participants
            if (senderType === 'admin') {
                await Conversation.findByIdAndUpdate(conversation._id, {
                    $addToSet: { participants: senderId } 
                });
            }

      resolve({
        status: "OK",
        message: "Message sent",
        data: newMessage,
      });
    } catch (e) {
      // Log lỗi ra để debug
      console.error("Create Message Service Error:", e);
      reject(e);
    }
  });
};

const getAllConversations = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Lấy tất cả conversation, sắp xếp mới nhất lên đầu
      // Populate 'participants' để lấy thông tin User (Tên, Avatar) hiển thị ra
      const conversations = await Conversation.find()
        .sort({ updatedAt: -1 })
        .populate("participants", "username avatar email") // Chỉ lấy các trường cần thiết
        .populate({
                    path: 'lastMessage.sender',
                    select: 'username isAdmin' // Lấy tên và quyền hạn
                })
        .lean(); // Dùng lean() để trả về object thuần JS, dễ gắn thêm thuộc tính

      // Duyệt qua từng cuộc hội thoại để đếm tin chưa đọc từ KHÁCH HÀNG
      // (Đây là logic đơn giản, với Big Data nên dùng Aggregation)
      const conversationsWithCount = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await Chat.countDocuments({
            conversationId: conv._id,
            senderType: { $in: ["customer", "guest"] }, // Tin của khách
            isRead: false,
          });
          return { ...conv, unreadCount };
        })
      );

      resolve({
        status: "OK",
        message: "Success",
        data: conversationsWithCount,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const markAsRead = (conversationId, readerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Update tất cả tin nhắn KHÔNG PHẢI do mình gửi -> thành đã đọc
      await Chat.updateMany(
        {
          conversationId: conversationId,
          sender: { $ne: readerId },
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      resolve({ status: "OK", message: "Marked as read" });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getMessages,
  createMessage,
  getAllConversations,
  markAsRead,
};
