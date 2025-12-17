// src/config/cookieConfig.js
const dotenv = require('dotenv');
dotenv.config();

// Kiểm tra xem đang chạy ở Production (Render) hay Local
// Nếu trên Render chưa set NODE_ENV, hãy vào Dashboard set NODE_ENV=production
const isProduction = process.env.NODE_ENV === 'production';

const cookieConfig = {
    httpOnly: true,    // Chống XSS (JS không đọc được cookie)
    path: '/',         // Cookie có hiệu lực ở toàn bộ trang
    
    // --- CẤU HÌNH QUAN TRỌNG ---
    // Render (HTTPS): True. Local (HTTP): False
    secure: isProduction, 
    
    // Render (Cross-domain): None. Local: Lax
    sameSite: isProduction ? 'None' : 'Lax',
    
    // Thời hạn 1 năm (bạn có thể sửa số này tùy ý)
    maxAge: 7 * 24 * 60 * 60 * 1000, 
};

module.exports = cookieConfig;