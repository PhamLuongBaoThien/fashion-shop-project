const PolicyService = require("../services/PolicyService");

const sendError = (res, error) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      status: "ERR",
      message: "Loại chính sách này đã tồn tại",
    });
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({
      status: "ERR",
      message: error.message,
    });
  }

  return res.status(error.statusCode || 500).json({
    status: "ERR",
    message: error.message || "Đã xảy ra lỗi",
  });
};

// Lấy danh sách gọn để giao diện công khai tạo liên kết khi cần.
const getPublishedPolicies = async (_req, res) => {
  try {
    const data = await PolicyService.getPublishedPolicies();
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return sendError(res, error);
  }
};

// Chỉ tìm bản đã publish; bản nháp được trả về như không tồn tại.
const getPublishedPolicyBySlug = async (req, res) => {
  try {
    const data = await PolicyService.getPublishedPolicyBySlug(req.params.slug);
    if (!data) {
      return res.status(404).json({ status: "ERR", message: "Chính sách chưa được xuất bản" });
    }
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllPoliciesForAdmin = async (_req, res) => {
  try {
    const data = await PolicyService.getAllPoliciesForAdmin();
    return res.status(200).json({ status: "OK", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const createPolicy = async (req, res) => {
  try {
    // updatedBy luôn lấy từ JWT, không nhận Admin ID từ phía client.
    const data = await PolicyService.createPolicy(req.body, req.user.id);
    return res.status(201).json({ status: "OK", message: "Tạo chính sách thành công", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const updatePolicy = async (req, res) => {
  try {
    const data = await PolicyService.updatePolicy(req.params.id, req.body, req.user.id);
    if (!data) {
      return res.status(404).json({ status: "ERR", message: "Không tìm thấy chính sách" });
    }
    return res.status(200).json({ status: "OK", message: "Cập nhật chính sách thành công", data });
  } catch (error) {
    return sendError(res, error);
  }
};

const deletePolicy = async (req, res) => {
  try {
    const data = await PolicyService.deletePolicy(req.params.id);
    if (!data) {
      return res.status(404).json({ status: "ERR", message: "Không tìm thấy chính sách" });
    }
    return res.status(200).json({ status: "OK", message: "Xóa chính sách thành công" });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  getPublishedPolicies,
  getPublishedPolicyBySlug,
  getAllPoliciesForAdmin,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
