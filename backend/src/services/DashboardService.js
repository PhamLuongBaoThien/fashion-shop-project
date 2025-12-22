const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

const getAllStats = (queryYear, queryMonth) => {
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

      // 4. Dữ liệu biểu đồ 
     const currentYear = queryYear ? Number(queryYear) : new Date().getFullYear();
      const currentMonth = queryMonth ? Number(queryMonth) : null;
      
      let startFilterDate, endFilterDate, groupBy, sortField, lengthArray;
      
      if (currentMonth) {
          // A. NẾU CÓ THÁNG: Lọc từ ngày 1 đến cuối tháng -> Group theo Ngày
          startFilterDate = new Date(currentYear, currentMonth - 1, 1);
          endFilterDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
          
          groupBy = { $dayOfMonth: "$createdAt" }; // MongoDB lấy ngày (1-31)
          lengthArray = new Date(currentYear, currentMonth, 0).getDate(); // Lấy số ngày trong tháng (28, 30, 31)
      } else {
          // B. NẾU KHÔNG CÓ THÁNG: Lọc cả năm -> Group theo Tháng (Logic cũ)
          startFilterDate = new Date(`${currentYear}-01-01`);
          endFilterDate = new Date(`${currentYear}-12-31 23:59:59`);
          
          groupBy = { $month: "$createdAt" }; // MongoDB lấy tháng (1-12)
          lengthArray = 12;
      }

      const chartStats = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startFilterDate,
              $lte: endFilterDate,
            },
            isPaid: true,
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: groupBy, // Group theo Ngày hoặc Tháng tùy điều kiện trên
            revenue: { $sum: "$totalPrice" },
            sales: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Format lại dữ liệu biểu đồ cho Frontend dễ dùng 
      const finalChartData = Array.from({ length: lengthArray }, (_, i) => {
        const timeUnit = i + 1; // Ngày 1 hoặc Tháng 1
        const stats = chartStats.find((item) => item._id === timeUnit);
        return {
          name: currentMonth ? `Ngảy ${timeUnit}` : `Thg ${timeUnit}`, // Label hiển thị
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
