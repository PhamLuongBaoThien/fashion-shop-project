const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");
// Bạn cần một middleware chỉ cho phép user đã đăng nhập, không phải admin
// Giả sử bạn dùng chung `authMiddleware`
const { authCustomerMiddleware } = require("../middleware/authCustomerMiddleware");
// Lấy giỏ hàng (khi user tải trang)
router.get("/", authCustomerMiddleware, CartController.getCartForUser);

// Thêm 1 sản phẩm
router.post("/add", authCustomerMiddleware, CartController.addItemToCart);

// Gộp giỏ hàng (khi đăng nhập)
router.post("/merge", authCustomerMiddleware, CartController.mergeLocalCart);

// API ĐỂ CẬP NHẬT SỐ LƯỢNG
router.post("/update-quantity", authCustomerMiddleware, CartController.updateItemQuantity);

// API ĐỂ XÓA 1 SẢN PHẨM
// (Dùng 'delete' hoặc 'post' đều được, 'post' dễ gửi body hơn)
router.post("/remove-item", authCustomerMiddleware, CartController.removeItemFromCart);

router.delete('/clear', authCustomerMiddleware, CartController.clearCart);

// (Bạn sẽ thêm các route cho REMOVE, UPDATE, CLEAR ở đây)

module.exports = router;