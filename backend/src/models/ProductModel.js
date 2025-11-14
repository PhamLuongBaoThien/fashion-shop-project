const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 }
});

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
    hasSizes: { type: Boolean, default: true }, // Mặc định là CÓ size
    stock: { type: Number, required: true, default: 0, min: 0 }, // Số lượng TỔNG
    sizes: {
      type: [sizeSchema], // Dùng schema con đã định nghĩa
      default: [] // Không bắt buộc (required) nữa
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User model
      required: true, // Bắt buộc phải có người tạo
    },
  },
  {
    timestamps: true,
  }
);

// Middleware xử lý slug tự động từ 'name' + tránh trùng lặp
productSchema.pre("save", async function (next) {
  // Chỉ tạo lại slug nếu name thay đổi hoặc chưa có slug
  if (this.isModified("name") || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true, locale: "vi" });
    let slug = baseSlug;
    let count = 1;

    // Kiểm tra xem slug đã tồn tại trong DB chưa
    while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`; // thêm hậu tố nếu trùng
    }

    this.slug = slug;
  }

  next();
});

productSchema.plugin(mongoosePaginate);

// Tạo index để tối ưu tìm kiếm
productSchema.index({ name: "text", description: "text" }); // Tối ưu: Thêm cả description vào text search

// (Tùy chọn nâng cao) có thể tạo thêm một index riêng cho việc lọc và sắp xếp
productSchema.index({ category: 1, price: 1, createdAt: -1 });


module.exports = mongoose.model("Product", productSchema);
