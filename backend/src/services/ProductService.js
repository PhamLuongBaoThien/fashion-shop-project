const Product = require("../models/ProductModel");

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

      const newProduct = await Product.create(productData);
      resolve({
        status: "OK",
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProduct = (productId, productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Cập nhật sản phẩm với dữ liệu mới
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { ...productData, updatedAt: Date.now() }, // Cập nhật updatedAt thủ công
        { new: true, runValidators: true } // Trả về tài liệu mới và chạy validation
      );
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
      const product = await Product.findById(productId);

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
  category,
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
      if (category && Array.isArray(category)) {
        query.category = { $in: category }; // Lọc nhiều danh mục
      } else if (
        category &&
        ["Áo", "Áo khoác", "Quần", "Đầm"].includes(category)
      ) {
        query.category = category; // Lọc một danh mục
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
      };

      // Xử lý sắp xếp
      switch (sortOption) {
        case "name_asc":
          options.sort.name = 1; // Sắp xếp tên A-Z
          break;
        case "price_desc":
          options.sort.price = -1; // Sắp xếp giá cao-thấp
          break;
        case "default":
        default:
          options.sort.createdAt = -1; // Mặc định theo thời gian tạo giảm dần
          break;
      }

      const products = await Product.paginate(query, options);
      resolve({
        status: "OK",
        message: "successfully",
        data: products.docs,
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
