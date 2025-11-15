// src/middleware/authCustomerMiddleware.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authCustomerMiddleware = (req, res, next) => {
  const tokenHeader = req.headers.token;
  if (!tokenHeader) {
    return res
      .status(401)
      .json({
        status: "ERR",
        message: "Chưa cung cấp Token (No token provided)",
      });
  }

  const token = tokenHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "ERR", message: "Xác thực thất bại (Unauthorized)" });
    }

    // ĐIỀU KIỆN QUAN TRỌNG
    if (user?.isAdmin) {
      // Nếu là Admin, CHẶN LẠI
      return res
        .status(403)
        .json({
          status: "ERR",
          message:
            "Tài khoản Admin không có quyền truy cập chức năng này (Forbidden)",
        });
    } else {
      // Nếu là khách hàng (user), cho phép đi tiếp
      req.user = user; // Gắn thông tin user vào request
      next();
    }
  });
};

module.exports = { authCustomerMiddleware };
