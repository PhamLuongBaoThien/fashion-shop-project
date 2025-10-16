const Product = require("../models/ProductModel");

const createProduct = (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tạo sản phẩm mới
      const checkProduct = await Product.findOne({ name: productData.name });
      if (checkProduct !== null) {
        return resolve({ status: "ERR", message: "Product name already exists" });
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
        resolve({ status: "ERR", message: "The product is not defined" });
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

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
};
