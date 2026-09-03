const express = require("express");
const ChatController = require("../controllers/ChatController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");
const {
  authCustomerMiddleware,
} = require("../middleware/authCustomerMiddleware");

const router = express.Router();

// API của khách: authCustomerMiddleware lấy user từ access token và chặn Admin.
router.get("/ai/messages", authCustomerMiddleware, ChatController.getAIMessages);
router.post("/ai/messages", authCustomerMiddleware, ChatController.sendAIMessage);

router.get(
  "/support/messages",
  authCustomerMiddleware,
  ChatController.getSupportMessages
);
router.post(
  "/support/messages",
  authCustomerMiddleware,
  ChatController.sendSupportMessage
);

// API của Admin: chỉ thao tác support chat, không đọc AI conversation của khách.
router.get(
  "/admin/support",
  authMiddleware,
  ChatController.getAdminSupportConversations
);
router.get(
  "/admin/support/:conversationId/messages",
  authMiddleware,
  ChatController.getAdminSupportMessages
);
router.post(
  "/admin/support/:conversationId/messages",
  authMiddleware,
  ChatController.sendAdminSupportMessage
);

// Endpoint dùng chung; service quyết định loại tin cần đánh dấu theo vai trò JWT.
router.patch(
  "/:conversationId/read",
  authUserMiddleware,
  ChatController.markAsRead
);

module.exports = router;
