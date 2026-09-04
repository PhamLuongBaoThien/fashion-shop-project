const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/UserModel");
const { Policy } = require("../models/PolicyModel");
const { sanitizePolicyContent } = require("../services/PolicyService");

dotenv.config();

// Nội dung mặc định bám theo các phương thức giao hàng, thanh toán và đổi trả
// đang được hiển thị trong ứng dụng. Admin có thể chỉnh sửa sau khi seed.
const DEFAULT_POLICIES = [
  {
    title: "Chính sách giao hàng",
    type: "shipping",
    slug: "shipping-policy",
    content: `
      <h2>Phạm vi giao hàng</h2>
      <p>D.E Fashion hỗ trợ giao hàng trên toàn quốc đến địa chỉ khách hàng cung cấp khi đặt hàng.</p>
      <h2>Phương thức và phí vận chuyển</h2>
      <ul>
        <li>Vận chuyển tiêu chuẩn: 30.000đ, dự kiến 3–5 ngày làm việc.</li>
        <li>Vận chuyển nhanh: 60.000đ, dự kiến 1–2 ngày làm việc.</li>
        <li>Vận chuyển qua đêm: 100.000đ, dự kiến giao vào ngày hôm sau.</li>
      </ul>
      <p>Phương thức, phí vận chuyển và tổng tiền được hiển thị tại trang thanh toán trước khi khách hàng xác nhận đơn.</p>
      <h2>Nhận hàng</h2>
      <p>Khách hàng vui lòng cung cấp đúng họ tên, số điện thoại và địa chỉ nhận hàng. Thời gian thực tế có thể thay đổi theo khu vực giao nhận hoặc tình huống ngoài kiểm soát.</p>
    `,
  },
  {
    title: "Chính sách đổi trả và hoàn tiền",
    type: "return",
    slug: "return-policy",
    content: `
      <h2>Điều kiện đổi trả</h2>
      <ul>
        <li>Hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm bị lỗi.</li>
        <li>Hỗ trợ đổi size miễn phí trong 3 ngày đầu.</li>
        <li>Sản phẩm phải chưa qua sử dụng, chưa giặt, còn nguyên tem mác và phụ kiện đi kèm.</li>
      </ul>
      <h2>Sản phẩm lỗi</h2>
      <p>Sản phẩm được xác nhận lỗi do nhà sản xuất sẽ được đổi sản phẩm phù hợp hoặc hoàn lại 100% giá trị sản phẩm.</p>
      <h2>Yêu cầu hỗ trợ</h2>
      <p>Khách hàng vui lòng cung cấp mã đơn hàng, mô tả tình trạng và hình ảnh liên quan qua mục Nhân viên hỗ trợ. Cửa hàng sẽ kiểm tra trước khi xác nhận phương án đổi trả hoặc hoàn tiền.</p>
    `,
  },
  {
    title: "Chính sách thanh toán",
    type: "payment",
    slug: "payment-policy",
    content: `
      <h2>Phương thức thanh toán</h2>
      <ul>
        <li>Thanh toán khi nhận hàng (COD).</li>
        <li>Thanh toán trực tuyến qua cổng VNPay.</li>
      </ul>
      <p>COD không áp dụng khi người đặt hàng chọn giao đến người nhận khác. Phương thức khả dụng và tổng số tiền phải trả được hiển thị trước khi xác nhận đơn hàng.</p>
      <h2>Thanh toán VNPay</h2>
      <p>Đơn hàng VNPay chỉ được ghi nhận là đã thanh toán sau khi hệ thống nhận kết quả thành công từ cổng thanh toán. Nếu giao dịch không thành công, khách hàng có thể thử lại hoặc chọn phương thức khác.</p>
      <h2>An toàn thanh toán</h2>
      <p>D.E Fashion không yêu cầu khách hàng gửi mật khẩu, mã OTP hoặc thông tin bảo mật ngân hàng qua trò chuyện hay email.</p>
    `,
  },
  {
    title: "Chính sách bảo mật",
    type: "privacy",
    slug: "privacy-policy",
    content: `
      <h2>Thông tin được thu thập</h2>
      <p>D.E Fashion có thể lưu thông tin tài khoản, thông tin liên hệ, địa chỉ giao hàng, lịch sử đơn hàng, nội dung hỗ trợ và trạng thái thanh toán do khách hàng cung cấp hoặc phát sinh khi sử dụng website.</p>
      <h2>Mục đích sử dụng</h2>
      <ul>
        <li>Tạo và quản lý tài khoản khách hàng.</li>
        <li>Xử lý đơn hàng, thanh toán, giao hàng và gửi email xác nhận.</li>
        <li>Hỗ trợ khách hàng và cải thiện trải nghiệm sử dụng.</li>
        <li>Phát hiện hành vi truy cập trái phép và bảo vệ hệ thống.</li>
      </ul>
      <h2>Chia sẻ thông tin</h2>
      <p>Thông tin chỉ được cung cấp cho dịch vụ cần thiết để vận hành đơn hàng, thanh toán, lưu trữ nội dung hoặc gửi email, và trong phạm vi cần thiết cho mục đích đó.</p>
      <h2>Quyền của khách hàng</h2>
      <p>Khách hàng có thể xem, cập nhật thông tin cá nhân trong tài khoản hoặc liên hệ Nhân viên hỗ trợ để yêu cầu kiểm tra, điều chỉnh thông tin.</p>
      <h2>Bảo mật tài khoản</h2>
      <p>Khách hàng có trách nhiệm giữ bí mật thông tin đăng nhập và thông báo cho cửa hàng khi phát hiện hoạt động bất thường.</p>
    `,
  },
  {
    title: "Điều khoản sử dụng",
    type: "terms",
    slug: "terms-and-conditions",
    content: `
      <h2>Phạm vi áp dụng</h2>
      <p>Khi truy cập, tạo tài khoản hoặc đặt hàng trên D.E Fashion, khách hàng đồng ý tuân thủ các điều khoản này và những chính sách được công bố trên website.</p>
      <h2>Tài khoản</h2>
      <p>Khách hàng phải cung cấp thông tin chính xác, bảo vệ thông tin đăng nhập và chịu trách nhiệm đối với hoạt động thực hiện từ tài khoản của mình. Cửa hàng có thể hạn chế tài khoản có dấu hiệu gian lận hoặc vi phạm.</p>
      <h2>Sản phẩm và đơn hàng</h2>
      <p>Thông tin giá, khuyến mãi và tồn kho được hiển thị tại thời điểm mua. Đơn hàng có thể được kiểm tra và xác nhận trước khi giao. Trong trường hợp hết hàng hoặc thông tin đơn không hợp lệ, cửa hàng sẽ liên hệ để hỗ trợ điều chỉnh.</p>
      <h2>Hành vi không được phép</h2>
      <p>Không được can thiệp trái phép vào hệ thống, sử dụng website cho mục đích gian lận, giả mạo danh tính hoặc gây ảnh hưởng đến người dùng khác.</p>
      <h2>Thay đổi nội dung</h2>
      <p>Các điều khoản và chính sách có thể được cập nhật để phù hợp với hoạt động của cửa hàng. Ngày cập nhật mới nhất được hiển thị trên từng trang chính sách.</p>
    `,
  },
];

// Seed chỉ chèn loại còn thiếu, vì vậy chạy lại sẽ không ghi đè bản Admin đã sửa.
const seedPolicies = async () => {
  const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`;
  await mongoose.connect(connectionString);

  try {
    const admin = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
    if (!admin) {
      throw new Error("Không tìm thấy tài khoản Admin để gán người cập nhật");
    }

    const operations = DEFAULT_POLICIES.map((policy) => ({
      updateOne: {
        filter: { type: policy.type },
        update: {
          $setOnInsert: {
            ...policy,
            content: sanitizePolicyContent(policy.content),
            isPublished: true,
            updatedBy: admin._id,
          },
        },
        upsert: true,
      },
    }));

    const result = await Policy.bulkWrite(operations);
    const insertedCount = result.upsertedCount || 0;
    console.log(`Đã tạo ${insertedCount} chính sách; ${DEFAULT_POLICIES.length - insertedCount} chính sách đã tồn tại.`);
  } finally {
    await mongoose.disconnect();
  }
};

seedPolicies().catch((error) => {
  console.error("Seed chính sách thất bại:", error.message);
  process.exitCode = 1;
});
