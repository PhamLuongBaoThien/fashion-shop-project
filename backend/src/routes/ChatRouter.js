const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddleware');

// API lấy tin nhắn của user hiện tại
// Yêu cầu đăng nhập (authMiddleware)
router.get('/get-messages', authUserMiddleware, ChatController.getMessages);

// API cho Admin lấy tin nhắn của khách cụ thể (sẽ dùng ở Phần 3)
router.get('/get-messages/:id', authMiddleware, ChatController.getMessages);

router.post('/create', authUserMiddleware, ChatController.createMessage); // Dùng authUserMiddleware để khách cũng gửi được

// API lấy danh sách hội thoại (Chỉ Admin được gọi)
router.get('/get-conversations', authMiddleware, ChatController.getAllConversations);

// Đánh dấu đã đọc tin nhắn
router.post('/read', authUserMiddleware, ChatController.markAsRead);


module.exports = router;