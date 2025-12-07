const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Liên kết tin nhắn này thuộc cuộc hội thoại nào
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    
    // Người gửi tin nhắn (User ID)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Nội dung tin nhắn
    text: { type: String, default: "" },
    
    // QUAN TRỌNG: Đánh dấu loại người gửi để Frontend vẽ giao diện
    // 'customer': Khách hàng (Vẽ bên phải)
    // 'admin': Nhân viên tư vấn (Vẽ bên trái)
    // 'bot': Chatbot tự động (Vẽ bên trái nhưng có icon Bot)
    senderType: { 
        type: String, 
        enum: ['customer', 'admin', 'bot'], 
        required: true 
    },
    
    // Trạng thái đã đọc
    isRead: { type: Boolean, default: false },
    
    // Hỗ trợ gửi ảnh (nếu có sau này)
    images: [{ type: String }] 

}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;