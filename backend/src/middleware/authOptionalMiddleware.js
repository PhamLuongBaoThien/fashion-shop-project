const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Middleware xác thực "linh hoạt".
 * - Nếu có token hợp lệ (và là Customer) -> gắn req.user.
 * - Nếu không có token, hoặc token không hợp lệ -> coi như Guest, cho đi tiếp.
 */
const authOptionalMiddleware = (req, res, next) => {
  const tokenHeader = req.headers.token;

  // 1. Không có token -> là Guest, cho qua
  if (!tokenHeader) {
    return next(); 
  }

  const token = tokenHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    
    // 2. Token không hợp lệ (hết hạn, sai) -> coi như Guest, cho qua
    if (err) {
      return next();
    }

    // 3. Token hợp lệ VÀ là khách hàng (không phải Admin)
    if (user) {
      req.user = user; // Gắn thông tin user vào request
    }
    
    // 4. Cho đi tiếp
    next();
  });
};

module.exports = { authOptionalMiddleware };