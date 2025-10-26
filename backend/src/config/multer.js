// src/config/multer.js
const multer = require('multer');

// Sử dụng memoryStorage để lưu file tạm thời trong RAM
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file, ví dụ 5MB
    }
});

module.exports = upload;