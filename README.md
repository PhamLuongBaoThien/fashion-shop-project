# Fashion Shop – Website Quản Lý & Mua Bán Quần Áo và Phụ Kiện Thời Trang

**Dự án cá nhân (MERN stack) – 1 thành viên**  
Backend (Render): https://de-store-backend.onrender.com  
GitHub: https://github.com/PhạmLuongBaoThien/fashion-shop-project

## Mô tả dự án (đúng như trong CV)
Website thương mại điện tử hoàn chỉnh với đầy đủ chức năng người dùng và quản trị viên.

### Tính năng chính:
- Frontend: Giao diện Ant Design, hiệu ứng Framer Motion, quản lý state bằng Redux Toolkit, gọi API bằng Axios.
- Backend: API theo mô hình MVC, MongoDB + Mongoose.
- Đăng ký / Đăng nhập / Cập nhật thông tin / Đổi mật khẩu (mã hóa Bcrypt).
- Xác thực JWT + Refresh Token trong httpOnly cookie, Access Token tự refresh mỗi 30 giây.
- Phân quyền chi tiết: Guest – User – Admin (có quyền con trong trang quản trị).
- Khách vãng lai vẫn có thể xem sản phẩm và thêm vào giỏ hàng.
- CRUD sản phẩm (hỗ trợ có size / không size), danh mục, người dùng, đơn hàng, giỏ hàng.
- Tự động gộp giỏ hàng Guest → User khi đăng nhập.
- Tìm kiếm, lọc, phân trang đồng bộ URL (Query Params) – dễ chia sẻ link.
- Upload ảnh qua Cloudinary (tối ưu ảnh sản phẩm và avatar).
- Thanh toán COD & VNPay sandbox.
- Gửi email xác nhận đơn hàng tự động bằng Nodemailer.
- Chat realtime với Admin bằng Socket.IO.
- Chatbot AI thông minh bằng Google Gemini API.

## Công nghệ sử dụng (đúng theo CV)
**Frontend**
- React.js, Redux Toolkit, Hooks, Axios
- Ant Design, Framer Motion

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT + Refresh Token (cookie), Bcrypt
- Socket.IO, Cloudinary, Nodemailer
- VNPay sandbox, Google Gemini API

**Quản lý mã nguồn**
- Git & GitHub

## Cài đặt & chạy local

```bash
# 1. Clone repo
git clone https://github.com/PhạmLuongBaoThien/fashion-shop-project.git
cd fashion-shop-project

# 2. Backend
cd backend
npm install

# TẠO FILE .env TRONG THƯ MỤC server (repo KHÔNG chứa .env thật để bảo mật)
# Tạo file server/.env và điền các biến sau:

PORT=3001
MONGO_USER=your_mongo_username
MONGO_PASSWORD=your_mongo_password
MONGO_CLUSTER=your_cluster.mongodb.net

FE_URL_LOCAL=http://localhost:3000
# FE_URL_PROD=... (khi deploy)

ACCESS_TOKEN=your_very_long_random_string_123
REFRESH_TOKEN=another_very_long_random_string_456

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

VNP_TMN_CODE=your_vnpay_tmn_code          # tùy chọn
VNP_HASH_SECRET=your_vnpay_hash_secret    # tùy chọn

MAIL_ACCOUNT=yourgmail@gmail.com
MAIL_PASSWORD=your_16_char_app_password   # Gmail App Password

GEMINI_API_KEY=your_gemini_api_key        # tùy chọn cho chatbot

# 3. Frontend (terminal mới)
cd ../frontend
npm install

# Tạo file .env trong thư mục client
# Tạo file client/.env với nội dung:

REACT_APP_API_KEY=http://localhost:3001/api
REACT_APP_API_URL=http://localhost:3001
# REACT_APP_API_URL_PROD=https://your-backend.onrender.com

