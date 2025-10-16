const express = require("express");
const router = express.Router();
const productRouter = require("../controllers/ProductController");


router.post("/create", productRouter.createProduct);

module.exports = router;
