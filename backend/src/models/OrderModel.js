const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Schema con cho từng sản phẩm TRONG ĐƠN HÀNG.
 * Quan trọng: Chúng ta phải "sao chép" (denormalize) tên, ảnh, và giá
 * vào đây, vì sản phẩm gốc (Product) có thể bị xóa hoặc thay đổi giá trong tương lai.
 * Đơn hàng phải là một bản ghi lịch sử không thay đổi.
 */
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true }, // Giá tại thời điểm mua
    size: { type: String, required: true }, // "One Size" cho sản phẩm không-size
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    _id: false,
  }
);

/**
 * Schema chính cho Đơn hàng.
 */
const orderSchema = new mongoose.Schema(
  {
    // --- AI ĐÃ MUA? ---

    // "Sợi dây liên kết" đến tài khoản người dùng
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Cho phép null (để khách vãng lai mua được)
    },

    // --- THÔNG TIN NGƯỜI MUA (BẮT BUỘC) ---
    // Ngay cả khi là khách, vẫn phải điền form này
    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true },
    },

    // --- THÔNG TIN GIAO HÀNG ---
    // (Tách riêng, vì người mua có thể đặt hàng cho người khác)
    shippingInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true }, // (Tên Tỉnh/Thành)
      district: { type: String, required: true }, // (Tên Quận/Huyện)
      ward: { type: String, required: true }, // (Tên Phường/Xã)
      detailAddress: { type: String, required: true }, // (Số nhà, tên đường)
    },

    // --- CHI TIẾT ĐƠN HÀNG ---
    orderItems: [orderItemSchema],

    paymentMethod: { type: String, required: true },

    itemsPrice: { type: Number, required: true, default: 0.0 }, // Tổng tiền hàng
    shippingPrice: { type: Number, required: true, default: 0.0 }, // Phí ship
    totalPrice: { type: Number, required: true, default: 0.0 }, // Tổng cộng

    // --- TRẠNG THÁI ĐƠN HÀNG ---
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
      // pending: Chờ xử lý (Mặc định khi mới đặt)
        // confirmed: Đã xác nhận (Shop đã thấy đơn)
        // shipped: Đang giao hàng (Đã đưa shipper)
        // delivered: Đã giao thành công
        // cancelled: Đã hủy

    },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
