const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    // category: {
    //   type: String,
    //   enum: ["Áo", "Áo khoác", "Quần", "Đầm"],
    //   required: [true, "Category is required"],
    // },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // "Tra cứu" trong model 'Category'
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    subImage: {
      type: [String],
      default: [],
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    // status: {
    //   type: String,
    //   enum: ["Còn hàng", "Hết hàng"],
    //   default: "Còn hàng",
    // },
    sizes: {
      type: [
        {
          size: {
            type: String,
            enum: ["XS", "S", "M", "L", "XL"],
            required: true,
          },
          quantity: { type: Number, min: 0, default: 0 },
        },
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: "", // Có thể để trống
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0, // Mặc định 0 nếu chưa có đánh giá
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware: Tự động tạo slug từ 'name' trước khi lưu
productSchema.pre('save', function(next) {
  // Chỉ tạo slug nếu trường 'name' được tạo mới hoặc bị thay đổi
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true, locale: 'vi' });
  }
  next(); // Tiếp tục quá trình lưu
});

productSchema.plugin(mongoosePaginate);

// Tạo index để tối ưu tìm kiếm
productSchema.index({ name: "text", description: "text" }); // Tối ưu: Thêm cả description vào text search

// (Tùy chọn nâng cao) có thể tạo thêm một index riêng cho việc lọc và sắp xếp
productSchema.index({ category: 1, price: 1, createdAt: -1 });


module.exports = mongoose.model("Product", productSchema);
