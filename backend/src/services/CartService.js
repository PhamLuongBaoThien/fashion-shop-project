const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel"); // Cần để kiểm tra sản phẩm

/**
 * Hàm nội bộ: Lấy giỏ hàng của user, nếu chưa có thì tạo mới.
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Cart>} Giỏ hàng của người dùng
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    // Nếu user này chưa có giỏ hàng, tạo một giỏ mới
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

/**
 * Lấy giỏ hàng chi tiết của người dùng
 * @param {string} userId - ID của người dùng
 */
const getCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name image price discount hasSizes sizes stock slug isActive",
      });

      if (!cart) {
        return resolve({
          status: "OK",
          message: "Giỏ hàng trống",
          data: { user: userId, items: [] },
        });
      }

      let totalAmount = 0;
      const processedItems = [];

      // DUYỆT TỪNG ITEM TRONG GIỎ ĐỂ KIỂM TRA TỒN KHO
      for (const item of cart.items) {
        if (!item.product) {
          // Sản phẩm bị xóa → bỏ qua
          continue;
        }

        if (!item.product.isActive) {
          // BỎ QUA, KHÔNG thêm vào giỏ, sẽ bị xóa khỏi DB ở dưới
          continue;
        }

        let currentStock = 0;

        if (item.product.hasSizes) {
          const sizeData = item.product.sizes.find((s) => s.size === item.size);
          currentStock = sizeData ? sizeData.quantity : 0;
        } else {
          currentStock = item.product.stock || 0;
        }

        const currentPrice =
          item.product.discount > 0
            ? Math.round(item.product.price * (1 - item.product.discount / 100))
            : item.product.price;

        // NẾU HẾT HÀNG → ĐÁNH DẤU + GIỮ NGUYÊN QUANTITY = 0 ĐỂ HIỂN THỊ MỜ
        if (currentStock === 0) {
          continue; // ← QUAN TRỌNG: Không thêm vào validItems
        }

        // NẾU CÒN HÀNG NHƯNG SỐ LƯỢNG TRONG GIỎ NHIỀU HƠN → GIẢM XUỐNG
        else if (item.quantity > currentStock) {
          item.quantity = currentStock;
        }

        processedItems.push({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          size: item.size,
          quantity: item.quantity,
          price: currentPrice,
          originalPrice: item.product.price, // Giá gốc
          discount: item.product.discount,   // % Giảm giá
          maxQuantity: currentStock,
          slug: item.product.slug,
        });
      }

      // CẬP NHẬT LẠI GIỎ HÀNG TRONG DB (nếu có thay đổi số lượng)
      cart.items = cart.items.filter((item) => {
        if (!item.product) return false;
        let stock = item.product.hasSizes
          ? item.product.sizes.find((s) => s.size === item.size)?.quantity || 0
          : item.product.stock || 0;
        return stock > 0;
      });

      if (cart.isModified("items")) {
        await cart.save();
      }

      resolve({
        status: "OK",
        message: "Tải giỏ hàng thành công",
        data: {
          items: processedItems,
          totalAmount,
          totalQuantity: processedItems.reduce((sum, i) => sum + i.quantity, 0),
        },
      });
    } catch (error) {
      console.error("Lỗi getCart:", error);
      reject(error);
    }
  });
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string} userId - ID của người dùng
 * @param {object} itemData - { product: 'id', size: 'M', quantity: 1 }
 */
const addToCart = (userId, itemData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product: productId, size, quantity } = itemData;

      // 1. Kiểm tra sản phẩm có thật không
      const product = await Product.findById(productId);
      if (!product) {
        return resolve({ status: "ERR", message: "Sản phẩm không tồn tại" });
      }

      // BƯỚC KIỂM TRA TỒN KHO (BẮT BUỘC)
      let availableStock = 0;

      if (product.hasSizes) {
        // --- Luồng 1: Sản phẩm CÓ size (Áo, Quần) ---
        const sizeData = product.sizes.find((s) => s.size === size);
        if (!sizeData) {
          return resolve({
            status: "ERR",
            message: "Size sản phẩm không hợp lệ",
          });
        }
        availableStock = sizeData.quantity;
      } else {
        // --- Luồng 2: Sản phẩm KHÔNG size (Nón) ---
        // (Giả sử size gửi lên là "One Size" hoặc N/A)
        availableStock = product.stock;
      }

      if (availableStock === 0) {
        return resolve({ status: "ERR", message: "Sản phẩm này đã hết hàng" });
      }

      // 2. Lấy giỏ hàng (hoặc tạo mới)
      const cart = await getOrCreateCart(userId);

      // 3. Kiểm tra xem item (với đúng size) đã có trong giỏ chưa
      const existingItem = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size
      );

      if (existingItem) {
        // --- LUỒNG CẬP NHẬT SỐ LƯỢNG ---
        const newQuantity = existingItem.quantity + quantity;

        // Kiểm tra lại tổng số lượng
        if (newQuantity > availableStock) {
          return resolve({
            status: "ERR",
            message: `Số lượng trong giỏ vượt quá tồn kho (Chỉ còn ${availableStock} sản phẩm)`,
          });
        }
        existingItem.quantity = newQuantity;
      } else {
        // --- LUỒNG THÊM MỚI ---
        // Kiểm tra số lượng thêm mới
        if (quantity > availableStock) {
          return resolve({
            status: "ERR",
            message: `Số lượng thêm vào vượt quá tồn kho (Chỉ còn ${availableStock} sản phẩm)`,
          });
        }
        cart.items.push({ product: productId, size, quantity });
      }

      await cart.save();

      // Trả về giỏ hàng đầy đủ thông tin
      const updatedCart = await getCart(userId);
      resolve({
        status: "OK",
        message: "Đã thêm vào giỏ hàng",
        data: updatedCart.data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 *  GỘP GIỎ HÀNG (Khi đăng nhập)
 * @param {string} userId - ID của người dùng
 * @param {Array} localCartItems - Mảng giỏ hàng từ localStorage
 */
const mergeCart = (userId, localCartItems) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await getOrCreateCart(userId);

      // Lặp qua từng món hàng "khách"
      for (const localItem of localCartItems) {
        const { product: productId, size, quantity: localQuantity } = localItem;

        // 1. Kiểm tra sản phẩm có thật không
        const product = await Product.findById(productId);

        if (product) {
          // 2. TÍNH TỒN KHO THỰC TẾ (AVAILABLE STOCK)
          let availableStock = 0;
          if (product.hasSizes) {
            // Sản phẩm có size (Áo)
            const sizeData = product.sizes.find((s) => s.size === size);
            availableStock = sizeData ? sizeData.quantity : 0;
          } else {
            // Sản phẩm không size (Nón)
            availableStock = product.stock;
          }

          // 3. Tìm món hàng đã có trong giỏ hàng DB
          const existingItem = cart.items.find(
            (i) => i.product.toString() === productId && i.size === size
          );

          if (existingItem) {
            // --- Đã có trong DB -> Gộp số lượng ---
            const newTotalQuantity = existingItem.quantity + localQuantity;

            // 4. KIỂM TRA VƯỢT KHO
            if (newTotalQuantity > availableStock) {
              // Nếu gộp bị vượt -> chỉ set bằng mức tối đa
              existingItem.quantity = availableStock;
            } else {
              existingItem.quantity = newTotalQuantity;
            }
          } else {
            // --- Chưa có trong DB -> Thêm mới ---

            // 4. KIỂM TRA VƯỢT KHO
            if (localQuantity > availableStock) {
              // Nếu thêm mới bị vượt -> chỉ set bằng mức tối đa
              cart.items.push({
                product: productId,
                size,
                quantity: availableStock,
              });
            } else {
              cart.items.push({
                product: productId,
                size,
                quantity: localQuantity,
              });
            }
          }

          // Lọc ra những item có số lượng > 0 (vì availableStock có thể là 0)
          cart.items = cart.items.filter((item) => item.quantity > 0);
        }
        // Nếu `product` không tồn tại (đã bị xóa), tự động bỏ qua món hàng đó
      }

      await cart.save();

      // Trả về giỏ hàng mới nhất đã được gộp và kiểm tra
      const updatedCart = await getCart(userId);
      resolve({
        status: "OK",
        message: "Đã gộp giỏ hàng thành công",
        data: updatedCart.data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Cập nhật số lượng của một món hàng trong giỏ (Đã check tồn kho)
 * @param {string} userId - ID của người dùng
 * @param {object} itemData - { product: 'id', size: 'M', quantity: 5 }
 */
const updateItemQuantity = (userId, itemData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product: productId, size, quantity: newQuantity } = itemData;

      // 1. Kiểm tra số lượng (nếu giảm về 0, chuyển sang xóa)
      if (newQuantity < 1) {
        return resolve(await removeItemFromCart(userId, itemData));
      }

      // 2. Kiểm tra sản phẩm có thật không
      const product = await Product.findById(productId);
      if (!product) {
        return resolve({ status: "ERR", message: "Sản phẩm không tồn tại" });
      }

      // 3. TÍNH TỒN KHO THỰC TẾ (AVAILABLE STOCK)
      let availableStock = 0;
      if (product.hasSizes) {
        const sizeData = product.sizes.find((s) => s.size === size);
        availableStock = sizeData ? sizeData.quantity : 0;
      } else {
        availableStock = product.stock;
      }

      // 4. KIỂM TRA VƯỢT KHO
      if (newQuantity > availableStock) {
        return resolve({
          status: "ERR",
          message: `Số lượng vượt quá tồn kho (Chỉ còn ${availableStock} sản phẩm)`,
        });
      }

      // 5. Cập nhật giỏ hàng
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return resolve({ status: "ERR", message: "Không tìm thấy giỏ hàng" });
      }

      const itemToUpdate = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size
      );

      if (!itemToUpdate) {
        return resolve({
          status: "ERR",
          message: "Sản phẩm không có trong giỏ",
        });
      }

      itemToUpdate.quantity = newQuantity;
      await cart.save();

      // 6. Trả về giỏ hàng mới nhất (đã populate)
      const updatedCart = await getCart(userId);
      resolve({
        status: "OK",
        message: "Cập nhật số lượng thành công",
        data: updatedCart.data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Xóa một món hàng khỏi giỏ
 * @param {string} userId - ID của người dùng
 * @param {object} itemData - { product: 'id', size: 'M' }
 */
const removeItemFromCart = (userId, itemData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product: productId, size } = itemData;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return resolve({ status: "ERR", message: "Không tìm thấy giỏ hàng" });
      }

      // Lọc ra, chỉ giữ lại những item KHÔNG KHỚP
      cart.items = cart.items.filter(
        (item) => !(item.product.toString() === productId && item.size === size)
      );

      await cart.save();

      // Trả về giỏ hàng mới nhất
      const updatedCart = await getCart(userId);
      resolve({
        status: "OK",
        message: "Đã xóa sản phẩm khỏi giỏ",
        data: updatedCart.data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Xóa toàn bộ sản phẩm trong giỏ hàng của user
 * @param {string} userId
 */
const clearCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm giỏ hàng và set mảng items về rỗng
      const cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
        { new: true } // Trả về data mới sau khi update
      );

      if (!cart) {
        return resolve({
          status: "ERR",
          message: "Giỏ hàng không tồn tại",
        });
      }

      resolve({
        status: "OK",
        message: "Đã xóa toàn bộ giỏ hàng",
        data: cart,
      });
    } catch (e) {
      reject(e);
    }
  });
};
// (Bạn sẽ tạo thêm các hàm `removeFromCart`, `updateItemQuantity`, `clearCart` ở đây)

module.exports = {
  getCart,
  addToCart,
  mergeCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
};
