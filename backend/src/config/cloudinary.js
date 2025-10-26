// src/config/cloudinary.js

const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary với các biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Export đối tượng cloudinary đã được cấu hình
module.exports = cloudinary;