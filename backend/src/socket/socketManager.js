const ChatService = require("../services/ChatService"); // Import Service

const socketManager = (io) => {
  io.on("connection", (socket) => { // Lắng nghe sự kiện kết nối
    console.log("🟢 User connected:", socket.id);

    socket.on("join_chat", (userId) => { //  gửi tín hiệu đến sự kiện có tên 'joim_chat' từ client 
      socket.join(userId); // Tham gia room của chính mình (userId)
    });

    socket.on("join_admin_channel", () => { // Admin tham gia kênh chung
      socket.join("admin_channel"); // Tham gia room admin_channel
    });

    // --- GỬI TIN NHẮN ---
    socket.on("send_message", async (data) => {
      // data: { senderId, receiverId, text, senderType }
      
      try {
        // 1. Gọi Service để lưu vào DB
        const response = await ChatService.createMessage(data);
        
        if (response.status === 'OK') {
            const newMessage = response.data;

            // 2. Bắn socket đi
            if (data.senderType === 'customer' || data.senderType === 'guest') {
                io.to("admin_channel").emit("new_message", newMessage); // Bắn cho Admin nếu người dùng là khách
            } else {
                // Admin/Bot gửi
                io.to(data.receiverId).emit("new_message", newMessage); // Bắn cho user cụ thể
            }
        }
      } catch (error) {
        console.error("Socket Error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected", socket.id);
    });
  });
};

module.exports = socketManager;