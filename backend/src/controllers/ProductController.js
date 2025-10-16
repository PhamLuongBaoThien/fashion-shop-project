const ProductService = require("../services/ProductService");

const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const productData = req.body;

    // Kiểm tra các trường bắt buộc
    if (!productData.name || !productData.category || !productData.price || !productData.image || !productData.sizes) {
      return res.status(400).json({ status: "ERR", message: "Missing required fields" });
    }

    // Gọi service để tạo sản phẩm
    const response = await ProductService.createProduct(productData);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};



module.exports = {
  createProduct,

};
