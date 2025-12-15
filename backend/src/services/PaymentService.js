const { VNPay, ignoreLogger } = require("vnpay");
const Order = require("../models/OrderModel");
const moment = require("moment");
require("dotenv").config();

// Khởi tạo instance VNPay
const vnpayInstance = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn", // Hoặc 'https://pay.vnpayment.vn' nếu là production
  testMode: true, // Để true khi đang test sandbox
  hashAlgorithm: "SHA512",
  enableLog: true, // Bật log để dễ debug
  loggerFn: ignoreLogger, // Có thể thay bằng console.log nếu muốn xem chi tiết
});

const createPaymentUrl = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const { amount, orderId, bankCode, language } = req.body;

      // Lấy IP address
      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      if (ipAddr === "::1") ipAddr = "127.0.0.1";

      // Thời gian hết hạn (ví dụ 15 phút)
      // Thư viện vnpay tự động xử lý vnp_CreateDate, ta chỉ cần truyền expireDate nếu muốn custom
      const expireDate = moment(new Date())
        .add(15, "minutes")
        .format("YYYYMMDDHHmmss");

      // Xây dựng URL thanh toán
      const urlString = vnpayInstance.buildPaymentUrl({
        vnp_Amount: amount, // Thư viện sẽ tự nhân 100 nếu bạn không cấu hình khác
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: "other",
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
        vnp_Locale: language || "vn",
        vnp_BankCode: bankCode || "",
        vnp_ExpireDate: expireDate,
      });

      console.log("🔗 LINK VNPAY TẠO RA:", urlString);
      resolve({ status: "OK", message: "Success", url: urlString });
    } catch (e) {
      reject(e);
    }
  });
};

// Hàm xử lý chung cho cả Return URL và IPN
const verifyAndProcessPayment = (vnp_Params) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("🔍 [VNPAY] Bắt đầu xác thực...");

      // Sử dụng thư viện để kiểm tra chữ ký (Checksum)
      // Hàm verifyReturnUrl kiểm tra cả chữ ký và mã phản hồi
      const verifyResult = vnpayInstance.verifyReturnUrl(vnp_Params);

      if (!verifyResult.isVerified) {
        console.log("❌ Checksum KHÔNG KHỚP!");
        return resolve({ status: "ERR", message: "Invalid Signature" });
      }

      if (!verifyResult.isSuccess) {
        console.log(
          "❌ Giao dịch thất bại hoặc bị hủy. Mã lỗi:",
          vnp_Params["vnp_ResponseCode"]
        );
        return resolve({
          status: "ERR",
          message: "Fail",
          data: { orderId: vnp_Params["vnp_TxnRef"] },
        });
      }

      // Nếu chữ ký đúng và giao dịch thành công (ResponseCode = 00)
      const orderId = vnp_Params["vnp_TxnRef"];
      console.log("✅ Giao dịch thành công! Đang cập nhật đơn hàng:", orderId);

      // CẬP NHẬT DB
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paidAt: new Date(),
          paymentMethod: "vnpay",
        },
        { new: true }
      );

      if (updatedOrder) {
        console.log("🎉 UPDATE THÀNH CÔNG! isPaid:", updatedOrder.isPaid);
        resolve({ status: "OK", message: "Success", data: { orderId } });
      } else {
        console.log("❌ UPDATE THẤT BẠI: Không tìm thấy Order ID trong DB!");
        resolve({
          status: "ERR",
          message: "Order not found",
          data: { orderId },
        });
      }
    } catch (e) {
      console.error("❌ LỖI SERVER:", e);
      reject(e);
    }
  });
};

module.exports = {
  createPaymentUrl,
  verifyAndProcessPayment,
};
