const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authOptionalMiddleware } = require("../middleware/authOptionalMiddleware");
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware")
const { checkBlockMiddleware } = require("../middleware/checkBlockMiddleware");
const { checkPermission } = require('../middleware/checkPermissionMiddleware');




router.post('/create', authOptionalMiddleware, checkBlockMiddleware, OrderController.createOrder);
router.get('/my-orders', authOptionalMiddleware, checkBlockMiddleware, OrderController.getAllOrdersDetails);
router.get('/detail/:id', authOptionalMiddleware, OrderController.getOrderDetails);
router.get('/get-all', authMiddleware, checkPermission('order'),  OrderController.getAllOrders);
router.put('/update/:id', authMiddleware,  checkPermission('order'),OrderController.updateOrder);


router.get('/get-all-order/:id', authMiddleware, checkPermission('order', 'user'), OrderController.getOrdersByUserId);
module.exports = router;