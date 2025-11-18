const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel'); // Model sản phẩm của bạn
const Cart = require('../models/CartModel');     // <-- THÊM: Model giỏ hàng
const mongoose = require('mongoose');

/**
 * Hàm tạo đơn hàng mới (Đã cập nhật logic kho + dọn dẹp giỏ hàng)
 * @param {object} orderData - Dữ liệu đơn hàng từ frontend (req.body)
 */
const createOrder = (orderData) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, shippingInfo, customerInfo, paymentMethod, itemsPrice, shippingPrice, totalPrice, user } = orderData;

        // 1. Bắt đầu một Giao dịch (Transaction)
        // Đảm bảo 3 việc: Trừ Kho, Tạo Order, Xóa Cart CÙNG THÀNH CÔNG hoặc CÙNG THẤT BẠI
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 2. Lặp qua TẤT CẢ sản phẩm để kiểm tra (lần cuối) và TRỪ KHO
            for (const item of orderItems) {
                const product = await Product.findById(item.product).session(session);

                if (!product) {
                    throw new Error(`Sản phẩm với ID ${item.product} không tồn tại`);
                }

                // --- Logic trừ kho (Đã khớp 100% với ProductModel của bạn) ---
                if (product.hasSizes) {
                    // --- CASE 1: SẢN PHẨM CÓ SIZE (Áo, Quần) ---
                    const sizeEntry = product.sizes.find(s => s.size === item.size);

                    if (!sizeEntry) {
                        throw new Error(`Size "${item.size}" của sản phẩm "${item.name}" không tồn tại`);
                    }
                    if (sizeEntry.quantity < item.quantity) {
                        // Lỗi hết hàng (nếu có người khác mua trong lúc đang checkout)
                        throw new Error(`Sản phẩm "${item.name}" (Size: ${item.size}) không đủ số lượng. Chỉ còn ${sizeEntry.quantity}.`);
                    }

                    // Trừ kho của size cụ thể
                    sizeEntry.quantity -= item.quantity;
                    
                    // Cập nhật lại tổng kho (giống hệt logic create/update product của bạn)
                    product.stock = product.sizes.reduce((total, s) => total + s.quantity, 0);

                } else {
                    // --- CASE 2: SẢN PHẨM KHÔNG CÓ SIZE (Nón) ---
                    if (product.stock < item.quantity) {
                        throw new Error(`Sản phẩm "${item.name}" không đủ số lượng. Chỉ còn ${product.stock}.`);
                    }
                    // Trừ kho tổng
                    product.stock -= item.quantity;
                }

                // Lưu lại sản phẩm đã bị trừ kho
                await product.save({ session });
            }
            // --- Kết thúc logic trừ kho ---


            // 3. TẠO ĐƠN HÀNG MỚI
            const newOrderArray = await Order.create([{
                orderItems,
                shippingInfo,
                customerInfo,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user: user || null, // `user` chính là `userId`
            }], { session });

            const newOrder = newOrderArray[0];

            // 4. DỌN DẸP GIỎ HÀNG (SAU KHI ĐÃ ĐẶT HÀNG)
            // Chỉ dọn dẹp nếu đây là user đã đăng nhập (guest không có giỏ hàng trong DB)
            if (user) {
                await Cart.findOneAndUpdate(
                    { user: user }, // Tìm giỏ hàng của user này
                    { $set: { items: [] } }, // Đặt mảng items về rỗng
                    { session } // Thực hiện trong cùng transaction
                );
            }

            // 5. HOÀN TẤT GIAO DỊCH
            // Chỉ đến lúc này, mọi thay đổi (Trừ kho, Tạo Order, Xóa Cart) mới thực sự được lưu.
            await session.commitTransaction();

            resolve({
                status: 'OK',
                message: 'Tạo đơn hàng thành công!',
                data: newOrder,
            });

        } catch (e) {
            // 6. NẾU CÓ LỖI (Hết hàng, lỗi DB) -> Hủy bỏ mọi thay đổi
            await session.abortTransaction();
            // Ném lỗi (ví dụ: "Sản phẩm... hết hàng") để Controller bắt
            reject(new Error(e.message)); 
        } finally {
            // 7. Luôn luôn kết thúc session
            session.endSession();
        }
    });
};

module.exports = {
    createOrder,
    // (Thêm các service khác như getOrderDetails, getAllOrders... ở đây)
};