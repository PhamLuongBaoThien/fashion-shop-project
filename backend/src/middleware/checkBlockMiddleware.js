const User = require("../models/UserModel");

const checkBlockMiddleware = async (req, res, next) => {
    // Chỉ check nếu đã xác định được user từ các middleware trước
    if (req.user && req.user.id) {
        try {
            // Query DB để lấy trạng thái mới nhất
            const currentUser = await User.findById(req.user.id);
            
            if (currentUser && currentUser.isBlocked) {
                return res.status(403).json({
                    status: 'ERR',
                    message: 'USER_BLOCKED', // Mã lỗi đặc biệt để Frontend bắt
                    details: 'Tài khoản của bạn đã bị khóa.'
                });
            }
        } catch (e) {
            // Lỗi DB thì cho qua hoặc báo lỗi tùy bạn
        }
    }
    next();
};

module.exports = { checkBlockMiddleware };