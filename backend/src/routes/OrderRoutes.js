const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authOptionalMiddleware } = require("../middleware/authOptionalMiddleware");
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware")
const { checkBlockMiddleware } = require("../middleware/checkBlockMiddleware");




router.post('/create', authOptionalMiddleware, checkBlockMiddleware, OrderController.createOrder);
router.get('/my-orders', authOptionalMiddleware, checkBlockMiddleware, OrderController.getAllOrdersDetails);
router.get('/detail/:id', authOptionalMiddleware, OrderController.getOrderDetails);
router.get('/get-all', authMiddleware, OrderController.getAllOrders);
router.put('/update/:id', authOptionalMiddleware, OrderController.updateOrder);
router.get('/get-all-order/:id', authMiddleware, OrderController.getOrdersByUserId);

module.exports = router;