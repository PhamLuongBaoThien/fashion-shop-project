const express = require("express");
const PolicyController = require("../controllers/PolicyController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: người dùng chỉ đọc được nội dung đã xuất bản.
router.get("/public", PolicyController.getPublishedPolicies);
router.get("/public/:slug", PolicyController.getPublishedPolicyBySlug);

// Admin: JWT quyết định quyền truy cập và danh tính người cập nhật.
router.get("/admin", authMiddleware, PolicyController.getAllPoliciesForAdmin);
router.post("/admin", authMiddleware, PolicyController.createPolicy);
router.put("/admin/:id", authMiddleware, PolicyController.updatePolicy);
router.delete("/admin/:id", authMiddleware, PolicyController.deletePolicy);

module.exports = router;
