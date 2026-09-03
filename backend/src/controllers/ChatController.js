const ChatService = require("../services/ChatService");

// API chỉ nhận nội dung text. sender/senderType/receiver luôn được backend suy ra
// từ JWT và endpoint đang gọi để tránh frontend giả mạo danh tính người gửi.
const getText = (req) => {
  const text = String(req.body?.text || "").trim();
  if (!text) throw new Error("Message text is required");
  if (text.length > 2000) throw new Error("Message is too long");
  return text;
};

const sendResponse = (res, response, successStatus = 200) => {
  if (response.status === "ERR") {
    const status = response.message === "Forbidden" ? 403 : 404;
    return res.status(status).json(response);
  }
  return res.status(successStatus).json(response);
};

/** GET lịch sử AI của user hiện tại. */
const getAIMessages = async (req, res) => {
  try {
    return res.json(await ChatService.getCustomerMessages(req.user.id, "ai"));
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

/** POST câu hỏi vào AI conversation của user hiện tại. */
const sendAIMessage = async (req, res) => {
  try {
    const response = await ChatService.sendAIMessage(
      req.user.id,
      getText(req),
      req.io
    );
    return sendResponse(res, response, 201);
  } catch (error) {
    return res.status(400).json({ status: "ERR", message: error.message });
  }
};

/** GET lịch sử support của user hiện tại. */
const getSupportMessages = async (req, res) => {
  try {
    return res.json(
      await ChatService.getCustomerMessages(req.user.id, "support")
    );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

/** POST tin hỗ trợ; lần đầu gọi mới tạo support conversation. */
const sendSupportMessage = async (req, res) => {
  try {
    const response = await ChatService.sendSupportMessage(
      req.user.id,
      getText(req),
      req.io
    );
    return sendResponse(res, response, 201);
  } catch (error) {
    return res.status(400).json({ status: "ERR", message: error.message });
  }
};

/** GET danh sách support chat dành cho Admin. */
const getAdminSupportConversations = async (req, res) => {
  try {
    return res.json(await ChatService.getAdminSupportConversations());
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

/** GET lịch sử một support chat và ngữ cảnh AI đi kèm. */
const getAdminSupportMessages = async (req, res) => {
  try {
    return sendResponse(
      res,
      await ChatService.getAdminSupportMessages(req.params.conversationId)
    );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

/** POST câu trả lời của Admin vào một support conversation. */
const sendAdminSupportMessage = async (req, res) => {
  try {
    const response = await ChatService.sendAdminSupportMessage(
      req.user.id,
      req.params.conversationId,
      getText(req),
      req.io
    );
    return sendResponse(res, response, 201);
  } catch (error) {
    return res.status(400).json({ status: "ERR", message: error.message });
  }
};

/** PATCH trạng thái đọc; service tự kiểm tra quyền sở hữu/vai trò. */
const markAsRead = async (req, res) => {
  try {
    return sendResponse(
      res,
      await ChatService.markAsRead({
        conversationId: req.params.conversationId,
        userId: req.user.id,
        isAdmin: Boolean(req.user.isAdmin),
      })
    );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  getAIMessages,
  sendAIMessage,
  getSupportMessages,
  sendSupportMessage,
  getAdminSupportConversations,
  getAdminSupportMessages,
  sendAdminSupportMessage,
  markAsRead,
};
