import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_KEY; // Ví dụ: http://localhost:3001/api

export const createPaymentUrl = async (data) => {
  // data = { amount, orderId, bankCode... }
  const res = await axios.post(`${API_BASE_URL}/payment/create_payment_url`, data);
  return res.data;
};

export const vnpayReturn = async (queryString) => {
    const res = await axios.get(`${API_BASE_URL}/payment/vnpay_return${queryString}`);
    return res.data;
}