const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const createDOMPurify = require("dompurify"); // dùng để làm sạch HTML
const { JSDOM } = require("jsdom"); //  dùng để tạo mô hình DOM trong môi trường Node.js

// Thiết lập DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const createProduct = (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tạo sản phẩm mới
      const checkProduct = await Product.findOne({ name: productData.name });
      if (checkProduct !== null) {
        return resolve({
          status: "ERR",
          message: "Product name already exists",
        });
      }

      if (productData.description) {
        // DOMPurify sẽ loại bỏ tất cả các thẻ nguy hiểm như <script>
        productData.description = DOMPurify.sanitize(productData.description);
      }

      const newProduct = await Product.create(productData);

      const populatedProduct = await Product.findById(newProduct._id).populate(
        "category"
      );

      resolve({
        status: "OK",
        message: "Product created successfully",
        data: populatedProduct,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProduct = (productId, productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (productData.description) {
        productData.description = DOMPurify.sanitize(productData.description);
      }
      // Cập nhật sản phẩm với dữ liệu mới
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { ...productData, updatedAt: Date.now() }, // Cập nhật updatedAt thủ công
        { new: true, runValidators: true } // Trả về tài liệu mới và chạy validation
      ).populate("category");
      if (!updatedProduct) {
        return resolve({ status: "ERR", message: "Product not found" });
      }
      resolve({
        status: "OK",
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailProduct = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId).populate("category");

      if (product === null) {
        return resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }
      resolve({
        status: "OK",
        message: "successfully",
        data: product,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteProduct = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findById(productId);

      if (checkProduct === null) {
        return resolve({ status: "ERR", message: "The user is not defined" });
      }

      await Product.findByIdAndDelete(productId);

      resolve({
        status: "OK",
        message: "successfully",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllProducts = (
  page,
  limit,
  search,
  categorySlug,
  priceRange,
  sizes,
  status,
  badges,
  sortOption
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};

      // Xử lý tìm kiếm full-text
      if (search) {
        query.$text = { $search: search };
      }

      // Xử lý danh mục (mảng hoặc giá trị đơn)
      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug });
        if (category) {
          query.category = category._id; // Lọc sản phẩm bằng _id của category
        } else {
          // Nếu không tìm thấy slug, trả về mảng rỗng vì không có sản phẩm nào khớp
          return resolve({
            status: "OK",
            message: "Category not found",
            data: [],
            pagination: { total: 0, current: 1, pageSize: limit, totalPages: 0 },
          });
        }
      }

      // Xử lý khoảng giá
      if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
        const [minPrice, maxPrice] = priceRange;
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      // Xử lý kích cỡ (mảng)
      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        query.sizes = {
          $elemMatch: { size: { $in: sizes }, quantity: { $gt: 0 } },
        };
      }

      // Xử lý trạng thái
      if (status && status !== "default") {
        query.status = status;
      }

      // Xử lý nhãn sản phẩm (giả định badges liên quan đến isNewProduct)
      if (badges && Array.isArray(badges) && badges.length > 0) {
        if (badges.includes("isNew")) {
          query.isNewProduct = true;
        }
        // Có thể mở rộng cho các nhãn khác nếu cần
      }

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: {},
        collation: { locale: "vi" },
        populate: 'category'
      };

      // Xử lý sắp xếp
      switch (sortOption) {
        case "name_asc":
          options.sort.name = 1; // Sắp xếp tên A-Z
          break;
        case "name_desc":
          options.sort.name = -1; // Tên: Z-A
          break;
        case "price_desc":
          options.sort.price = -1; // Sắp xếp giá cao-thấp
          break;
        case "price_asc":
          options.sort.price = 1; // Giá: Thấp đến Cao
          break;
        case "default":
        default:
          options.sort = { createdAt: -1, _id: 1 };
          break;
      }

      const products = await Product.paginate(query, options);

      // Chuyển Mongoose documents thành plain JavaScript objects
      const plainProducts = products.docs.map((doc) => doc.toObject());

      // Lặp qua và thêm trường inventoryStatus
      const productsWithStatus = plainProducts.map((product) => {
        const totalStock = product.sizes.reduce(
          (total, size) => total + size.quantity,
          0
        );
        return {
          ...product,
          inventoryStatus: totalStock > 0 ? "Còn hàng" : "Hết hàng",
        };
      });

      resolve({
        status: "OK",
        message: "successfully",
        data: productsWithStatus,
        pagination: {
          total: products.totalDocs,
          current: products.page,
          pageSize: products.limit,
          totalPages: products.totalPages,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProducts,
};
