const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authOptionalMiddleware } = require("../middleware/authOptionalMiddleware");




router.post('/create', authOptionalMiddleware, OrderController.createOrder);

// (Thêm các routes khác như GET /:id, GET /my-orders... ở đây)

module.exports = router;