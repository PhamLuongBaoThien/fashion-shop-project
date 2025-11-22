const PaymentService = require('../services/PaymentService');

/**
 * API Tạo URL thanh toán VNPay
 * POST /api/payment/create_payment_url
 */
const createPaymentUrl = async (req, res) => {
    try {
        // Gọi service để tạo URL
        // Kết quả trả về là object { status: 'OK', message: '...', url: '...' }
        const response = await PaymentService.createPaymentUrl(req);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Lỗi Server khi tạo URL thanh toán'
        });
    }
};

/**
 * API Xử lý kết quả trả về từ VNPay (IPN / Return URL)
 * GET /api/payment/vnpay_return
 */
const vnpayReturn = async (req, res) => {
    try {
        // req.query chứa toàn bộ tham số mà VNPay trả về trên URL
        const response = await PaymentService.vnpayReturn(req.query);
        
        // Trả kết quả xác thực về cho Frontend
        // Frontend sẽ dựa vào status: 'OK' để hiển thị thông báo thành công
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Lỗi Server khi xác thực thanh toán'
        });
    }
};

// POST /api/payment/vnpay_ipn
const vnpayIPN = async (req, res) => {
    try {
        console.log("VNPAY IPN:", req.body);
        const response = await PaymentService.vnpayReturn(req.body);
        res.status(200).json({ RspCode: 0, Message: 'OK' });
    } catch (e) {
        console.error("IPN ERROR:", e);
        res.status(200).json({ RspCode: 1, Message: 'Error' });
    }
};

module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIPN, 
};