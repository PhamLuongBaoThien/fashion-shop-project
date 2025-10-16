const Product = require("../models/ProductModel");

const createProduct = (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tạo sản phẩm mới
        const checkProduct = await Product.findOne({ name: productData.name });
      if (checkProduct !== null) {
        resolve({ status: "ERR", message: "Product name already exists" });
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



module.exports = {
  createProduct,

};
