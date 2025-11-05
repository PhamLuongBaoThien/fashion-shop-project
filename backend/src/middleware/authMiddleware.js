const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.token.split(' ')[1]; // xóa Beare
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
    return res.status(401).json({ status: "ERR", message: "No token provided" });
  }
const token = req.headers.token.split(' ')[1]; // xóa Beare
const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(401).json({ status: "ERR", message: "Unauthorized" });
    }

      if (user?.isAdmin || user?.id === userId) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ status: "ERR", message: "Forbidden" });
      }
  });
};
module.exports = {authMiddleware, authUserMiddleware};
