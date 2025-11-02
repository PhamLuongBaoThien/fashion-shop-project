const Category = require("../models/CategoryModel");

const createCategory = (categoryData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra tên danh mục đã tồn tại chưa
      const checkCategory = await Category.findOne({ name: categoryData.name });
      if (checkCategory !== null) {
        return resolve({ status: "ERR", message: "Category name already exists" });
      }
        const newCategory = await Category.create(categoryData);
        resolve({
          status: "OK",
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
      reject(error);
    }
    });
};

const updateCategory = (categoryId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true }
      );
        if (updatedCategory === null) {
            return resolve({
                status: "ERR",
                message: "Category not found",
            });
        } 
        resolve({
            status: "OK",
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
      reject(error);
    }
    });
}

const getDetailCategory = (categoryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findById(categoryId);
        if (category === null) {
            return resolve({
                status: "ERR",
                message: "Category not found",
            });
        }
        resolve({
            status: "OK",
            message: "Category retrieved successfully",
            data: category,
        });
    } catch (error) {
      reject(error);
    }   
    });
};

const getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        resolve({
            status: "OK",
            message: "Categories retrieved successfully",
            data: categories,
        });
    } catch (error) {
      reject(error);
    }
});
}

module.exports = {
  createCategory,
  getDetailCategory,
  getAllCategories,
  updateCategory,
};