const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, CategoryController.createCategory);

router.get("/detail/:id", CategoryController.getDetailCategory);
router.get("/get-all", CategoryController.getAllCategories);
router.put("/update/:slug", authMiddleware, CategoryController.updateCategory);

module.exports = router;
