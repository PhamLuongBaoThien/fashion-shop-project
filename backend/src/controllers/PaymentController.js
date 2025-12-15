const PaymentService = require('../services/PaymentService');

const createPaymentUrl = async (req, res) => {
    try {
        const response = await PaymentService.createPaymentUrl(req);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Lỗi Server khi tạo URL thanh toán'
        });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        // req.query chứa tham số trả về từ VNPay khi redirect
        const response = await PaymentService.verifyAndProcessPayment(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Lỗi Server khi xác thực thanh toán'
        });
    }
};

const vnpayIPN = async (req, res) => {
    try {
        console.log("VNPAY IPN:", req.query); // IPN thường gửi qua Query String (GET)
        // Lưu ý: VNPay IPN chính thức thường là GET, nhưng một số document cũ ghi POST.
        // Bạn nên kiểm tra req.query hoặc req.body tùy theo cấu hình VNPay gửi về.
        // Thường IPN là req.query.
        
        const params = Object.keys(req.body).length > 0 ? req.body : req.query;
        
        const response = await PaymentService.verifyAndProcessPayment(params);
        
        if (response.status === 'OK') {
            res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            // Nếu lỗi signature
            if (response.message === 'Invalid Signature') {
                res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
            } else {
                res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' }); // Hoặc mã lỗi khác tùy logic
            }
        }
    } catch (e) {
        console.error("IPN ERROR:", e);
        res.status(200).json({ RspCode: '99', Message: 'Unknow error' });
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn,
    vnpayIPN, 
};