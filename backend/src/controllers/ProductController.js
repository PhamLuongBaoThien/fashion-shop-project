const ProductService = require("../services/ProductService");

const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const productData = req.body;

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

    // Gọi service để cập nhật sản phẩm
    const response = await ProductService.updateProduct(productId, productData);
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
    return res.status(201).json({ response });
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
        return res.status(201).json({ response });
      } catch (error) {
        return res.status(500).json({ status: "ERR", message: error.message });
      }
}

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct
};
