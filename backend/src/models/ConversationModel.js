const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Danh sách người tham gia chat (Thường là [ID_Khach, ID_Admin])
    // Dùng mảng để sau này có thể mở rộng chat nhóm nếu cần
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    
    // Lưu tin nhắn cuối cùng để hiển thị ở danh sách chat bên ngoài cho nhanh
    // (Giống Zalo/Messenger hiện 1 dòng tin nhắn cuối)
    lastMessage: {
        text: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seen: { type: Boolean, default: false }, // Đã xem chưa
        createdAt: { type: Date, default: Date.now }
    },

    // Quan trọng cho Chatbot sau này:
    // 'active': Đang chat với nhân viên
    // 'closed': Đã xong việc
    // 'bot_handling': Bot đang trả lời (Admin chưa can thiệp)
    status: { 
        type: String, 
        default: 'bot_handling', // Mặc định để Bot tiếp khách trước
        enum: ['active', 'closed', 'bot_handling'] 
    } 
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;