import axios from "axios";
import { axiosJWT } from "./UserService"; // Import cả 2

// Lấy base URL từ biến môi trường
const API_BASE_URL = process.env.REACT_APP_API_KEY;

/**
 * Gửi dữ liệu đơn hàng (orderData) lên backend để tạo mới.
 * API này CÔNG KHAI (public) để cho phép khách (guest) thanh toán.
 * @param {object} orderData - Đối tượng orderData (đã dịch tên tỉnh/huyện/xã)
 */
export const createOrder = async (orderData) => {
  // Dùng `axios` thường vì API này là public
  const res = await axiosJWT.post(`${API_BASE_URL}/orders/create`, orderData, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * Lấy tất cả đơn hàng CỦA TÔI (người dùng đã đăng nhập).
 * API này YÊU CẦU ĐĂNG NHẬP.
 */
export const getMyOrders = async () => {
  // Dùng `axiosJWT` vì API này yêu cầu xác thực
  const res = await axiosJWT.get(`${API_BASE_URL}/orders/my-orders`);
  return res.data;
};

/**
 * Lấy chi tiết một đơn hàng (của người dùng đã đăng nhập).
 * API này YÊU CẦU ĐĂNG NHẬP.
 * @param {string} orderId - ID của đơn hàng
 */
export const getOrderDetails = async (orderId) => {
  // Dùng `axiosJWT`
  const res = await axiosJWT.get(`${API_BASE_URL}/orders/detail/${orderId}`);
  return res.data;
};

export const getAllOrders = async (access_token) => {
    const res = await axiosJWT.get(`${API_BASE_URL}/orders/get-all`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};


export const updateOrder = async (id, access_token, data) => {
    const res = await axiosJWT.put(`${API_BASE_URL}/orders/update/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    });
    return res.data;
};

// Lấy danh sách đơn hàng của 1 user cụ thể (Admin dùng)
export const getOrdersByUserId = async (id, access_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_KEY}/orders/get-all-order/${id}`);
    return res.data;
}