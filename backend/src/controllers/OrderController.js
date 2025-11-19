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

const getAllOrdersDetails = async (req, res) => {
    try {
        // Lấy userId từ token (đã qua middleware)
        // Nếu là Guest (không đăng nhập), req.user sẽ không có -> userId = undefined
        const userId = req.user?.id || req.user?._id;
        
        if (!userId) {
             return res.status(200).json({
                status: 'ERR',
                message: 'Yêu cầu đăng nhập để xem đơn hàng'
            });
        }

        const response = await OrderService.getAllOrdersDetails(userId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
};


const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Lấy thông tin người đang request từ token (được middleware giải mã)
        // Nếu không có token (Guest) -> userId = null, isAdmin = false
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const isAdmin = req.user ? req.user.isAdmin : false;

        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }

        // Truyền thêm userId và isAdmin vào Service để kiểm tra quyền
        const response = await OrderService.getOrderDetails(orderId, userId, isAdmin);
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const data = await OrderService.getAllOrders()
        return res.status(200).json(data)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


module.exports = {
    createOrder,
    getAllOrdersDetails,
    getOrderDetails,
    getAllOrders

    // (Thêm các controller khác ở đây)
};