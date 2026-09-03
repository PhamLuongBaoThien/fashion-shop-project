const mongoose = require("mongoose");

// Bản tóm tắt tin cuối giúp trang Admin sắp xếp và hiển thị danh sách chat
// mà không phải truy vấn toàn bộ Message của từng conversation.
const lastMessageSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderType: {
      type: String,
      enum: ["customer", "admin", "bot", "system"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    // Mỗi conversation thuộc đúng một khách hàng đã đăng nhập.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["ai", "support"],
      required: true,
    },
    lastMessage: { type: lastMessageSchema, default: null },
    // Với support chat, lưu tối đa 10 Message gần nhất từ AI chat tại thời
    // điểm khách gửi yêu cầu để Admin hiểu ngữ cảnh trước đó.
    contextMessages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    ],
  },
  { timestamps: true }
);

// Ràng buộc quan trọng: một user chỉ có một AI chat và một support chat.
conversationSchema.index({ customer: 1, type: 1 }, { unique: true });
// Tối ưu danh sách support chat được sắp theo hoạt động gần nhất.
conversationSchema.index({ type: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
