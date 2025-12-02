const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const { checkPermission } = require("../middleware/checkPermissionMiddleware"); // Import


router.post(
  "/create",
  authMiddleware,
  checkPermission('product'),
  upload.fields([
    { name: "image", maxCount: 1 }, // 1 file cho ảnh chính
    { name: "subImage", maxCount: 5 }, // Tối đa 5 file cho ảnh phụ
  ]),
  ProductController.createProduct
);
router.put(
  "/update/:id",
  authMiddleware,
  checkPermission('product'),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subImage", maxCount: 5 },
  ]),
  ProductController.updateProduct
);
router.get("/detail/:id", ProductController.getDetailProduct);
router.get("/detail-by-slug/:slug", ProductController.getDetailProductBySlug);
router.delete("/delete/:id", authMiddleware,checkPermission('product'), ProductController.deleteProduct);
router.post("/delete-many", authMiddleware,checkPermission('product'), ProductController.deleteManyProducts);
router.get("/get-all", ProductController.getAllProducts);
router.get("/related/:slug", ProductController.getRelatedProducts);
module.exports = router;
