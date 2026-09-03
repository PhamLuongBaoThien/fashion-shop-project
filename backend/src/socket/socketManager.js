const jwt = require("jsonwebtoken");

// Token được gửi trong socket.handshake.auth khi frontend kết nối.
const getSocketToken = (socket) => {
  const rawToken = socket.handshake.auth?.token;
  if (!rawToken) return null;
  return rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
};

const socketManager = (io) => {
  // Xác thực trước khi cho socket kết nối; client không được tự khai báo user/role.
  io.use((socket, next) => {
    const token = getSocketToken(socket);
    if (!token) return next(new Error("Unauthorized"));

    jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
      if (error) return next(new Error("Unauthorized"));
      socket.user = user;
      return next();
    });
  });

  io.on("connection", (socket) => {
    // Server tự gán room từ JWT. Không có event join room do client điều khiển.
    socket.join(`user:${socket.user.id}`);
    if (socket.user.isAdmin) socket.join("admins:support");

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketManager;
