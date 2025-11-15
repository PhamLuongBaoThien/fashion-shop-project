const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema con cho từng sản phẩm trong giỏ hàng.
 * Chúng ta chỉ lưu ID, size và số lượng.
 * Giá và tên sẽ được lấy (lookup) từ ProductModel khi hiển thị giỏ hàng,
 * để đảm bảo giá luôn được cập nhật.
 */
const cartItemSchema = new mongoose.Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    size: { 
        type: String, 
        required: true 
        // Frontend sẽ gửi "One Size" hoặc "Default" nếu sản phẩm không có size
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    }
}, {
    // Tắt _id cho schema con này để giảm dung lượng
    _id: false 
});

/**
 * Schema chính cho giỏ hàng.
 * Mỗi người dùng (User) chỉ có MỘT giỏ hàng (unique: true).
 */
const cartSchema = new mongoose.Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true // Quan trọng: Mỗi user chỉ có 1 giỏ hàng duy nhất
    },
    items: [cartItemSchema], // Một mảng chứa các sản phẩm
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;