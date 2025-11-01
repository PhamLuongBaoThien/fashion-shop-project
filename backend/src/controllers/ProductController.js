const ProductService = require("../services/ProductService");
const cloudinary = require("../config/cloudinary");
const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const productData = req.body;

    // Vì FormData gửi mọi thứ dưới dạng string, ta cần parse lại thanh object/array
    if (productData.sizes) {
      productData.sizes = JSON.parse(productData.sizes);
    }
    // Chuyển đổi các trường boolean
    if (productData.isNewProduct) {
      productData.isNewProduct = productData.isNewProduct === "true";
    }
    if (productData.isActive) {
      productData.isActive = productData.isActive === "true";
    }

    // 2. XỬ LÝ UPLOAD ẢNH CHÍNH
    if (req.files && req.files.image) {
      const mainImageFile = req.files.image[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(mainImageFile.buffer);
      });
      productData.image = result.secure_url;
    }

    // 3. XỬ LÝ UPLOAD ẢNH PHỤ (NHIỀU ẢNH)
    if (req.files && req.files.subImage) {
      const subImageFiles = req.files.subImage;
      const subImageUrls = [];

      // Dùng Promise.all để upload song song nhiều ảnh, tăng hiệu suất
      await Promise.all(
        subImageFiles.map(async (file) => {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });
          subImageUrls.push(result.secure_url);
        })
      );
      productData.subImage = subImageUrls;
    }

    // Kiểm tra các trường bắt buộc
    if (
      !productData.name ||
      !productData.category ||
      !productData.price ||
      !productData.image ||
      !productData.sizes
    ) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Missing required fields" });
    }

    // Gọi service để tạo sản phẩm
    const response = await ProductService.createProduct(productData);

    if (response.status === "ERR") {
      return res.status(400).json(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Kiểm tra ID
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Product ID is required" });
    }

    // Kiểm tra nếu có dữ liệu cần cập nhật
    if (!productData || Object.keys(productData).length === 0) {
      return res
        .status(400)
        .json({ status: "ERR", message: "No data provided for update" });
    }

    // Chuyển đổi các trường JSON từ string sang object/array
    if (productData.sizes) {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (productData.isNewProduct) {
      productData.isNewProduct = productData.isNewProduct === "true";
    }
    if (productData.isActive) {
      productData.isActive = productData.isActive === "true";
    }

    // BẮT ĐẦU LOGIC XỬ LÝ ẢNH MỚI
    let finalSubImages = [];

    if (productData.retainedSubImages) {
      finalSubImages = JSON.parse(productData.retainedSubImages);
    }
    // Xử lý upload ảnh chính (nếu có ảnh mới)
    if (req.files && req.files.image) {
      const mainImageFile = req.files.image[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(mainImageFile.buffer); // Dùng .buffer
      });
      productData.image = result.secure_url;
    }

    // Xử lý upload ảnh phụ (nếu có ảnh mới)
    if (req.files && req.files.subImage) {
      const newSubImageUrls = await Promise.all(
        req.files.subImage.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result.secure_url);
                }
              );
              uploadStream.end(file.buffer);
            })
        )
      );
      // 4. Gộp danh sách ảnh cũ và ảnh mới
      finalSubImages.push(...newSubImageUrls);
    }

    // 5. Gán mảng ảnh cuối cùng vào productData
    productData.subImage = finalSubImages;

    // Xóa trường tạm đi để không lưu vào DB
    delete productData.retainedSubImages;

    // Gọi service để cập nhật sản phẩm
    const response = await ProductService.updateProduct(productId, productData);
    if (response.status === "ERR") {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The productId is required" });
    }
    const response = await ProductService.getDetailProduct(productId);
    return res.status(200).json( response );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The userid is required" });
    }
    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json( response );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      category,
      priceRange,
      sizes,
      status,
      badges,
      sortOption,
    } = req.query;
    const response = await ProductService.getAllProducts(
      page,
      limit,
      search,
      category ? category.split(",") : null, // Chuyển chuỗi thành mảng
      priceRange ? priceRange.split(",").map(Number) : null, // Chuyển chuỗi thành mảng số
      sizes ? sizes.split(",") : null, // Chuyển chuỗi thành mảng
      status,
      badges ? badges.split(",") : null, // Chuyển chuỗi thành mảng
      sortOption
    );
    return res.status(200).json( response );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProducts,
};
