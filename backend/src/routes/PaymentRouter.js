const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// API tạo link thanh toán
router.post('/create_payment_url', PaymentController.createPaymentUrl); 
router.get('/vnpay_ipn', PaymentController.vnpayIPN); // API nhận kết quả thanh toán (IPN)
// API kiểm tra kết quả (Frontend sẽ gọi API này khi được redirect về)
router.get('/vnpay_return', PaymentController.vnpayReturn); // API kiểm tra kết quả (Frontend sẽ gọi API này khi được redirect về)

module.exports = router;