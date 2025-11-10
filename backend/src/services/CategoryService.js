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

// src/services/CategoryService.js (Backend)

// Hàm này nhận `categoryId` và `data` (chính là `updateData` từ Controller)
const updateCategory = (categoryId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. "Giải nén" name và description từ `data`
      const { name, description } = data; 

      // 2. Tìm danh mục bằng ID TRƯỚC TIÊN
      const category = await Category.findById(categoryId);
      if (category === null) {
        return resolve({ status: "ERR", message: "Không tìm thấy danh mục" });
      }

      // 3. Kiểm tra xem TÊN MỚI có bị trùng với một mục KHÁC không
      if (name) { 
        const checkName = await Category.findOne({ 
          name: name, 
          _id: { $ne: categoryId } // $ne = Not Equal (không bao gồm chính nó)
        });
        
        if (checkName !== null) {
          return resolve({ status: "ERR", message: "Tên danh mục này đã tồn tại" });
        }
      }

      // 4. Cập nhật các trường vào object đã tìm thấy
      if (name !== undefined) {
        category.name = name; // Gán tên mới
      }
      if (description !== undefined) {
        category.description = description;
      }

      // 5. GỌI .save() ĐỂ LƯU VÀ KÍCH HOẠT pre('save') HOOK (để cập nhật slug)
      // Đây là bước mấu chốt để slug tự động cập nhật
      const updatedCategory = await category.save();

      resolve({
        status: "OK",
        message: "Cập nhật danh mục thành công",
        data: updatedCategory,
      });

    } catch (e) {
      // Bắt lỗi E11000 (trùng lặp) từ Mongoose
      if (e.code === 11000) {
        return resolve({ status: "ERR", message: `Giá trị bị trùng lặp: ${Object.keys(e.keyValue)}` });
      }
      reject(e);
    }
  });
};

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