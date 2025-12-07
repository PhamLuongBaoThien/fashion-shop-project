const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.token.split(" ")[1]; // xóa Beare
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(404).json({ status: "ERR", message: "Unauthorized" });
    }
    if (user?.isAdmin) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ status: "ERR", message: "Forbidden" });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "ERR", message: "No token provided" });
  }
  const token = req.headers.token.split(" ")[1]; // xóa Beare
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(401).json({ status: "ERR", message: "Unauthorized" });
    }

    const userIdFromUrl = req.params.id;

    // TRƯỜNG HỢP 1: API có tham số :id (Ví dụ: xem chi tiết user, sửa user)
    // Cần check: Là Admin HOẶC Chính chủ
    if (userIdFromUrl) {
      if (user?.isAdmin || user?.id === userIdFromUrl) {
        req.user = user;
        next();
      } else {
        return res
          .status(403)
          .json({ status: "ERR", message: "Forbidden: Access denied" });
      }
    }
    // TRƯỜNG HỢP 2: API không có tham số :id (Ví dụ: /get-messages, /profile)
    // Chỉ cần đã đăng nhập là OK. Controller sẽ tự lấy ID từ req.user.id
    else {
      req.user = user;
      next();
    }
  });
};
module.exports = { authMiddleware, authUserMiddleware };
