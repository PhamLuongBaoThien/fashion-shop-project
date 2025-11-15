import { axiosJWT } from "./UserService"; // Import axiosJWT vì đây là API cần đăng nhập

/**
 * Lấy giỏ hàng của user từ database
 */
export const getCart = async () => {
  const res = await axiosJWT.get(`${process.env.REACT_APP_API_KEY}/cart`);
  return res.data;
};

/**
 * Thêm 1 sản phẩm vào giỏ hàng trên database
 * @param {object} itemData - { product: 'id', size: 'M', quantity: 1 }
 */
export const addToCart = async (itemData) => {
  const res = await axiosJWT.post(`${process.env.REACT_APP_API_KEY}/cart/add`, itemData);
  return res.data;
};

/**
 * Gộp giỏ hàng localStorage lên database
 * @param {object} items - { items: [...] }
 */
export const mergeCart = async (items) => {
  const res = await axiosJWT.post(`${process.env.REACT_APP_API_KEY}/cart/merge`, items);
  return res.data;
};

// (Bạn sẽ thêm các hàm remove, update, clear API ở đây)