const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    address: {
      province: { type: String, trim: true, default: "" }, // Thêm default
      district: { type: String, trim: true, default: "" }, // Thêm default
      ward: { type: String, trim: true, default: "" }, // Thêm default
      detailAddress: { type: String, trim: true, default: "" }, // Thêm default
    },
    gender: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },

  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
