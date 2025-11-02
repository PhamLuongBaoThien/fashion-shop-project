const CategoryService = require('../services/CategoryService');

const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const result = await CategoryService.createCategory(categoryData);
    if (result.status === "ERR") {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
    } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
    }

};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updateData = req.body;
    const result = await CategoryService.updateCategory(categoryId, updateData);
    if (result.status === "ERR") {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getDetailCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The categoryId is required " });
    }
    const response = await CategoryService.getDetailCategory(categoryId);
    return res.status(200).json( response );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  } 
};

const getAllCategories = async (req, res) => {
  try {
    const response = await CategoryService.getAllCategories();
    return res.status(200).json( response );
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  } 
};

module.exports = {
  createCategory,
  getDetailCategory,
  getAllCategories,
    updateCategory,
};