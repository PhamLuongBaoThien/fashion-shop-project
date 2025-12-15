const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

const getAllStats = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Đếm số lượng đơn giản
      const productCount = await Product.countDocuments();
      const userCount = await User.countDocuments({ isAdmin: false }); // Chỉ đếm khách hàng
      const orderCount = await Order.countDocuments();

      // 2. Tính tổng doanh thu (Chỉ tính các đơn đã thanh toán)
      const revenueAgg = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

      // 5. ĐẾM ĐƠN HÀNG CHỜ XỬ LÝ (chưa giao + chưa thanh toán)
      const pendingOrdersCount = await Order.countDocuments({ status: "pending" });

      // 6. ĐẾM SẢN PHẨM HẾT HÀNG
      const outOfStockCount = await Product.countDocuments({
        $or: [
          { hasSizes: true, $expr: { $eq: [{ $sum: "$sizes.quantity" }, 0] } }, // Có size nhưng tổng quantity = 0
          { hasSizes: false, stock: { $lte: 0 } }, // Không size nhưng stock <= 0
        ],
      });

      // 3. Lấy 5 đơn hàng gần nhất
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email") // Populate để lấy tên user nếu cần
        .populate("shippingInfo", "fullName"); // Lấy tên người nhận

      // 4. Dữ liệu biểu đồ (Thống kê theo tháng trong năm nay)
      const currentYear = new Date().getFullYear();
      const monthlyStats = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
            isPaid: true, // Chỉ tính đơn đã thanh toán vào doanh thu
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" }, // Nhóm theo tháng (1-12)
            revenue: { $sum: "$totalPrice" }, // Tổng doanh thu
            sales: { $sum: 1 }, // Tổng số đơn thành công
          },
        },
        { $sort: { _id: 1 } }, // Sắp xếp từ tháng 1 -> 12
      ]);

      // Format lại dữ liệu biểu đồ cho Frontend dễ dùng (lấp đầy các tháng thiếu nếu cần)
      // Tạo mảng 12 tháng mặc định là 0
      const finalChartData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const stats = monthlyStats.find((item) => item._id === month);
        return {
          name: `Thg ${month}`,
          revenue: stats ? stats.revenue : 0,
          sales: stats ? stats.sales : 0,
        };
      });

      resolve({
        status: "OK",
        message: "Success",
        data: {
          users: userCount,
          products: productCount,
          orders: orderCount,
          revenue: totalRevenue,
          pendingOrders: pendingOrdersCount,
          outOfStock: outOfStockCount,
          recentOrders,
          chartData: finalChartData,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { getAllStats };
