const OrderService = require('../services/OrderService');

/**
 * Controller để nhận request tạo đơn hàng mới
 */
const createOrder = async (req, res) => {
    try {
        // Dữ liệu đơn hàng (orderData) sẽ nằm trong req.body
        const orderData = req.body;

        if (req.user) {
            // Nếu middleware xác thực được token -> đây là user đã đăng nhập
            orderData.user = req.user.id; 
        } else {
            // Nếu không có token (hoặc token không hợp lệ) -> đây là Guest
            orderData.user = null;
        }

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!orderData || !orderData.orderItems || orderData.orderItems.length === 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Dữ liệu đơn hàng không hợp lệ. Cần có ít nhất 1 sản phẩm.'
            });
        }
        if (!orderData.shippingInfo || !orderData.customerInfo || !orderData.paymentMethod) {
             return res.status(400).json({
                status: 'ERR',
                message: 'Thông tin khách hàng, giao hàng, hoặc phương thức thanh toán bị thiếu.'
            });
        }

        // Gọi service để tạo đơn hàng
        const response = await OrderService.createOrder(orderData);
        
        // Trả về kết quả cho client
        return res.status(201).json(response);

    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Lỗi máy chủ khi tạo đơn hàng'
        });
    }
};

module.exports = {
    createOrder,
    // (Thêm các controller khác ở đây)
};