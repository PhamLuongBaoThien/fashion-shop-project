const CartService = require("../services/CartService");

// API để lấy giỏ hàng của user
const getCartForUser = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware
    const response = await CartService.getCart(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ status: "ERR", message: e.message });
  }
};

// API để thêm 1 sản phẩm
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = req.body; // { product: '...', size: 'M', quantity: 1 }

    if (!itemData.product || !itemData.size || !itemData.quantity) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Thiếu thông tin sản phẩm" });
    }

    const response = await CartService.addToCart(userId, itemData);
    return res.status(response.status === "OK" ? 200 : 400).json(response);
  } catch (e) {
    return res.status(500).json({ status: "ERR", message: e.message });
  }
};

// API để gộp giỏ hàng
const mergeLocalCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const localCartItems = req.body.items; // Mong đợi nhận { items: [...] }

    if (!Array.isArray(localCartItems)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Dữ liệu giỏ hàng không hợp lệ" });
    }

    const response = await CartService.mergeCart(userId, localCartItems);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ status: "ERR", message: e.message });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = req.body; // { product: 'id', size: 'M', quantity: 5 }

    if (
      !itemData.product ||
      !itemData.size ||
      itemData.quantity === undefined
    ) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Thiếu thông tin sản phẩm" });
    }

    const response = await CartService.updateItemQuantity(userId, itemData);
    return res.status(response.status === "OK" ? 200 : 400).json(response);
  } catch (e) {
    return res.status(500).json({ status: "ERR", message: e.message });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = req.body; // { product: 'id', size: 'M' }

    if (!itemData.product || !itemData.size) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Thiếu thông tin sản phẩm" });
    }

    const response = await CartService.removeItemFromCart(userId, itemData);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({ status: "ERR", message: e.message });
  }
};

module.exports = {
  getCartForUser,
  addItemToCart,
  mergeLocalCart,
  updateItemQuantity,
  removeItemFromCart,
};
