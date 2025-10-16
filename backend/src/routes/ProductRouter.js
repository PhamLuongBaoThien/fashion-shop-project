const express = require("express");
const router = express.Router();
const productRouter = require("../controllers/ProductController");


router.post("/create", productRouter.createProduct);
router.put("/update/:id", productRouter.updateProduct);
router.get("/detail/:id", productRouter.getDetailProduct);
router.delete("/delete/:id", productRouter.deleteProduct);

module.exports = router;
