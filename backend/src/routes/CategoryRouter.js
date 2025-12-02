const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/checkPermissionMiddleware");

router.post("/create", authMiddleware, checkPermission('category'), CategoryController.createCategory);

router.get("/detail/:id", CategoryController.getDetailCategory);
router.get("/get-all", CategoryController.getAllCategories);
router.put("/update/:id", authMiddleware, checkPermission('category'), CategoryController.updateCategory);

module.exports = router;
