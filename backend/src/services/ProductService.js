const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const createDOMPurify = require("dompurify"); // dùng để làm sạch HTML
const { JSDOM } = require("jsdom"); //  dùng để tạo mô hình DOM trong môi trường Node.js

// Thiết lập DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

//xử lý kích cỡ: các size trùng, sắp xếp theo thứ tự cho API create và update
const processAndSortSizes = (sizes) => {
  if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
    return []; // Trả về mảng rỗng nếu không có gì
  }

  // Định nghĩa thứ tự size chuẩn
  const sizeOrder = ["XS", "S", "M", "L", "XL"];

  // 1. GOM (MERGE) CÁC SIZE TRÙNG LẶP
  // Dùng Map để cộng dồn số lượng của các size trùng nhau
  const sizeMap = new Map();
  sizes.forEach((item) => {
    // Chỉ xử lý nếu có size và quantity
    if (item.size && item.quantity !== null && item.quantity !== undefined) {
      const currentQuantity = sizeMap.get(item.size) || 0;
      sizeMap.set(item.size, currentQuantity + Number(item.quantity));
    }
  });

  // 2. Chuyển Map trở lại thành mảng
  const mergedSizes = Array.from(sizeMap, ([size, quantity]) => ({
    size,
    quantity,
  }));

  // 3. SẮP XẾP (SORT) MẢNG ĐÃ GOM
  const sortedSizes = mergedSizes.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.size);
    const indexB = sizeOrder.indexOf(b.size);
    return indexA - indexB;
  });

  return sortedSizes;
};

// Tính toán trạng thái tồn kho (inventoryStatus)
//  dựa trên việc sản phẩm có size hay không.
const getInventoryStatus = (product) => {
  let totalStock = 0;
  if (product.hasSizes) {
    // Luồng 1: Sản phẩm có size (áo, quần)
    // Tính tổng tồn kho từ mảng sizes
    totalStock = product.sizes.reduce(
      (total, size) => total + size.quantity,
      0
    );
  } else {
    // Luồng 2: Sản phẩm không size (nón)
    // Lấy trực tiếp từ trường stock
    totalStock = product.stock;
  }
  return totalStock > 0 ? "Còn hàng" : "Hết hàng";
};

const createProduct = (productData, userId) => {
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

      if (productData.hasSizes === "true" || productData.hasSizes === true) {
        // --- LUỒNG 1: SẢN PHẨM CÓ SIZE (Áo, Quần) ---
        if (!productData.sizes || productData.sizes.length === 0) {
          return resolve({
            status: "ERR",
            message: "Sản phẩm CÓ size thì phải có ít nhất 1 size",
          });
        }
        // Chỉ gọi processAndSortSizes MỘT LẦN ở đây
        productData.sizes = processAndSortSizes(productData.sizes); // Tự động tính stock tổng từ các size
        productData.stock = productData.sizes.reduce(
          (acc, s) => acc + Number(s.quantity),
          0
        );
      } else {
        // --- LUỒNG 2: SẢN PHẨM KHÔNG SIZE (Nón) ---
        productData.sizes = []; // Đảm bảo mảng sizes rỗng
        if (productData.stock === undefined || Number(productData.stock) < 0) {
          return resolve({
            status: "ERR",
            message: "Vui lòng nhập số lượng tổng cho sản phẩm không size",
          });
        }
      }

      const newProduct = await Product.create({
        ...productData,
        createdBy: userId, // Gán "dấu vân tay"
      });

      const populatedProduct = await Product.findById(newProduct._id)
        .populate("category")
        .populate("createdBy", "username email"); // Lấy username và email người tạo;

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

      //1. Lấy product gốc từ DB
      const product = await Product.findById(productId);
      if (!product) {
        return resolve({ status: "ERR", message: "Product not found" });
      }

      // Kiểm tra và "dọn dẹp" mảng sizes trước khi cập nhật
      // XỬ LÝ STOCK VÀ SIZES
      if (productData.hasSizes === "true" || productData.hasSizes === true) {
        // --- LUỒNG 1: SẢN PHẨM CÓ SIZE (Áo, Quần) ---
        if (!productData.sizes || productData.sizes.length === 0) {
          return resolve({
            status: "ERR",
            message: "Sản phẩm CÓ size thì phải có ít nhất 1 size",
          });
        }
        productData.sizes = processAndSortSizes(productData.sizes); // Dọn dẹp
        // Tự động tính stock tổng từ các size
        productData.stock = productData.sizes.reduce(
          (acc, s) => acc + Number(s.quantity),
          0
        );
      } else {
        // --- LUỒNG 2: SẢN PHẨM KHÔNG SIZE (Nón) ---
        productData.sizes = []; // Đảm bảo mảng sizes rỗng
        // `productData.stock` sẽ được lấy từ form
        if (productData.stock === undefined || productData.stock < 0) {
          return resolve({
            status: "ERR",
            message: "Sản phẩm KHÔNG size phải có số lượng tổng",
          });
        }
      }
      //2. Cập nhật các field (chỉ ghi đè những field được gửi lên)
      Object.keys(productData).forEach((key) => {
        product[key] = productData[key];
      });

      //3. Cập nhật updatedAt
      product.updatedAt = Date.now();

      //4. Gọi save() → middleware pre('save') sẽ tự chạy
      const updatedProduct = await product.save();

      //5. Populate lại category nếu cần
      await updatedProduct.populate("category");

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

      const inventoryStatus = getInventoryStatus(product);
      const productObject = product.toObject();
      productObject.inventoryStatus = inventoryStatus;

      resolve({
        status: "OK",
        message: "successfully",
        data: productObject,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailProductBySlug = (slug) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Dùng findOne({ slug }) thay vì findById()
      // 2. Populate thêm category và createdBy
      const product = await Product.findOne({ slug: slug })
        .populate("category") // Lấy toàn bộ object category
        .populate("createdBy", "username email"); // Chỉ lấy username và email của người tạo

      // Nếu không tìm thấy sản phẩm, HOẶC sản phẩm đó đang bị ẩn
      if (product === null || product.isActive === false) {
        return resolve({
          status: "ERR",
          message: "Sản phẩm không tìm thấy", // Trả về một lỗi 404 chung
        });
      }

      // 3. Tính toán lại trạng thái tồn kho (Rất quan trọng cho trang chi tiết)
      const totalStock = product.sizes.reduce(
        (total, size) => total + size.quantity,
        0
      );
      const inventoryStatus = getInventoryStatus(product);
      const productObject = product.toObject();
      productObject.inventoryStatus = inventoryStatus;

      resolve({
        status: "OK",
        message: "Tải sản phẩm thành công",
        data: productObject, // Trả về sản phẩm đã được làm giàu
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
  categorySlugs,
  priceRange,
  sizes,
  status,
  badges,
  sortOption,
  isActive
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};

      // Xử lý tìm kiếm full-text
      if (search) {
        query.$text = { $search: search };
      }

      // Nếu có tham số `isActive`, chỉ lọc các sản phẩm có trạng thái đó
      if (isActive !== undefined && isActive !== null) {
        query.isActive = isActive === "true"; // Chuyển chuỗi "true" thành boolean
      }

      // XỬ LÝ DANH MỤC: MẢNG SLUG
      if (
        categorySlugs &&
        Array.isArray(categorySlugs) &&
        categorySlugs.length > 0
      ) {
        const categories = await Category.find({
          slug: { $in: categorySlugs },
        });
        const categoryIds = categories.map((cat) => cat._id);

        if (categoryIds.length > 0) {
          query.category = { $in: categoryIds };
        } else {
          // Không tìm thấy → trả rỗng
          return resolve({
            status: "OK",
            data: [],
            pagination: { total: 0, current: 1, pageSize: 10, totalPages: 0 },
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

      // XỬ LÝ TRẠNG THÁI
      if (status && typeof status === "string") {
        const statusList = status.split(",").map((s) => s.trim());

        if (statusList.length > 0) {
          const orConditions = [];

          if (statusList.includes("on-sale")) {
            orConditions.push({ discount: { $gt: 0 } });
          }
          if (statusList.includes("new-arrival")) {
            orConditions.push({ isNewProduct: true });
          }

          if (orConditions.length > 0) {
            query.$or = orConditions;
          }
        }
      }

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: {},
        collation: { locale: "vi" },
        populate: [
          { path: "category", select: "name slug" },
          { path: "createdBy", select: "username" }, // Chỉ lấy trường 'username'
        ],
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
          inventoryStatus: getInventoryStatus(product),
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

const deleteManyProducts = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Dùng deleteMany và toán tử $in để xóa tất cả sản phẩm có _id nằm trong mảng ids
      const result = await Product.deleteMany({ _id: { $in: ids } });

      resolve({
        status: "OK",
        message: "Products deleted successfully",
        data: result, // Trả về kết quả (vd: { deletedCount: 3 })
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getRelatedProducts = (slug, page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Tìm sản phẩm hiện tại để biết category của nó là gì
      const currentProduct = await Product.findOne({ slug: slug });
      if (!currentProduct) {
        return resolve({ status: "OK", data: [], pagination: { total: 0 } });
      }

      const categoryId = currentProduct.category;

      // 2. Xây dựng query:
      const query = {
        category: categoryId, // Tìm sản phẩm cùng category
        _id: { $ne: currentProduct._id }, // Loại trừ ($ne) chính sản phẩm đang xem
        isActive: true, // Chỉ lấy sản phẩm đang hoạt động
      };

      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 4, // Mặc định 4 sản phẩm
        populate: "category", // Vẫn populate để CardComponent có thể đọc
        sort: { createdAt: -1 }, // Mới nhất trước
      };

      const products = await Product.paginate(query, options);

      // 3. Tính toán inventoryStatus cho các sản phẩm liên quan
      const productsWithStatus = products.docs.map((product) => {
        return {
          ...product.toObject(),
          inventoryStatus: getInventoryStatus(product), // Dùng hàm trợ giúp
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
  getDetailProductBySlug,
  deleteProduct,
  getAllProducts,
  deleteManyProducts,
  getRelatedProducts,
};
