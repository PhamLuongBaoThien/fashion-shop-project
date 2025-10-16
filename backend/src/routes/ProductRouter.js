const express = require("express");
const router = express.Router();
const productRouter = require("../controllers/ProductController");
const { authMiddleware } = require("../middleware/authMiddleware");


router.post("/create", authMiddleware, productRouter.createProduct);
router.put("/update/:id", authMiddleware, productRouter.updateProduct);
router.get("/detail/:id",productRouter.getDetailProduct);
router.delete("/delete/:id", authMiddleware, productRouter.deleteProduct);
router.get("/get-all", productRouter.getAllProducts);

module.exports = router;
