const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.post('/create_payment_url', PaymentController.createPaymentUrl); 
router.get('/vnpay_ipn', PaymentController.vnpayIPN); 
router.get('/vnpay_return', PaymentController.vnpayReturn); 

module.exports = router;