const express = require("express");
const router = express.Router();
const productRouter = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

router.post(
  "/create",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 }, // 1 file cho ảnh chính
    { name: "subImage", maxCount: 5 }, // Tối đa 5 file cho ảnh phụ
  ]),
  productRouter.createProduct
);
router.put(
  "/update/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subImage", maxCount: 5 },
  ]),
  productRouter.updateProduct
);
router.get("/detail/:id", productRouter.getDetailProduct);
router.delete("/delete/:id", authMiddleware, productRouter.deleteProduct);
router.get("/get-all", productRouter.getAllProducts);

module.exports = router;
