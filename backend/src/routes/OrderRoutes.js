const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authOptionalMiddleware } = require("../middleware/authOptionalMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware")




router.post('/create', authOptionalMiddleware, OrderController.createOrder);
router.get('/my-orders', authOptionalMiddleware, OrderController.getAllOrdersDetails);
router.get('/detail/:id', authOptionalMiddleware, OrderController.getOrderDetails);
router.get('/get-all', authMiddleware, OrderController.getAllOrders);


// (Thêm các routes khác như GET /:id, GET /my-orders... ở đây)

module.exports = router;