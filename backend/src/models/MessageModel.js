const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // Bot/system không có User tương ứng; customer/admin bắt buộc có sender.
      required() {
        return ["customer", "admin"].includes(this.senderType);
      },
    },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    senderType: {
      type: String,
      enum: ["customer", "admin", "bot", "system"],
      required: true,
    },
    // Hai cờ đọc độc lập để tính badge chưa đọc cho khách và phía Admin.
    readByCustomer: { type: Boolean, default: false },
    readByAdmin: { type: Boolean, default: false },
    images: [{ type: String }],
  },
  { timestamps: true }
);

// Tối ưu việc tải lịch sử theo đúng thứ tự thời gian.
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
