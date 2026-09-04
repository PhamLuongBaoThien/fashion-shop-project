const mongoose = require("mongoose");

const POLICY_TYPES = ["shipping", "return", "payment", "privacy", "terms"];

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      enum: POLICY_TYPES,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 100000,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Policy = mongoose.model("Policy", policySchema);

module.exports = { Policy, POLICY_TYPES };
