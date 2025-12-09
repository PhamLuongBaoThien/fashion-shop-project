const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// chat socket.io setup
const { createServer } = require("http");
const { Server } = require("socket.io");
const socketManager = require("./socket/socketManager");

dotenv.config();

const app = express();
const port = process.env.PORT;



const allowedOrigins = [
  process.env.FE_URL_LOCAL, // Biến cho Localhost
  process.env.FE_URL_PROD, // Biến cho Cloudflare Pages
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Lệnh này sẽ xóa các giá trị null/undefined khỏi mảng;

console.log("Allowed Origins:", allowedOrigins); 


app.use(
  cors({
    origin: function (origin, callback) {
    // Cho phép request không có origin (như Postman, Mobile App)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("❌ Blocked CORS form Origin:", origin); // Log để biết ai bị chặn
      callback(new Error('Not allowed by CORS'));
    }},
    credentials: true, // Cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(express.json({ limit: "50mb" })); // Hỗ trợ đọc JSON body với kích thước lớn. Mặc định, Express chỉ cho phép request body (dữ liệu gửi lên) có kích thước rất nhỏ (khoảng 100kb).
// app.use(bodyParser.json()); // luôn luôn đứng trước các route
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser()); // luôn luôn đứng trước các route

// Thiết lập Socket.io
// (Socket.io cần chạy trên HTTP Server thuần chứ không chạy trực tiếp trên Express app)
const httpServer = createServer(app);

// CORS giúp Frontend (port 3000) có thể kết nối tới Backend (port 3001)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Dùng chung whitelist với HTTP
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["token"],
  },
  // Quan trọng: Thêm cấu hình này để tối ưu trên môi trường Cloud
  transports: ['flashsocket','websocket'], 
  path: '/socket.io/'
});

// Truyền biến 'io' vào hàm socketManager để bắt đầu lắng nghe
socketManager(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

routes(app);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
