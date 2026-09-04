import axios from "axios";
import { axiosJWT } from "./UserService";

const API_BASE_URL = process.env.REACT_APP_API_KEY;

// Public API không cần token và chỉ nhận các chính sách đã xuất bản.
export const getPublishedPolicies = async () => {
  const response = await axios.get(`${API_BASE_URL}/policy/public`);
  return response.data;
};

export const getPublishedPolicyBySlug = async (slug) => {
  const response = await axios.get(`${API_BASE_URL}/policy/public/${slug}`);
  return response.data;
};

// Các API dưới đây dùng axiosJWT để tự gắn/refresh access token của Admin.
export const getAdminPolicies = async () => {
  const response = await axiosJWT.get(`${API_BASE_URL}/policy/admin`);
  return response.data;
};

export const createPolicy = async (data) => {
  const response = await axiosJWT.post(`${API_BASE_URL}/policy/admin`, data);
  return response.data;
};

export const updatePolicy = async (id, data) => {
  const response = await axiosJWT.put(`${API_BASE_URL}/policy/admin/${id}`, data);
  return response.data;
};

export const deletePolicy = async (id) => {
  const response = await axiosJWT.delete(`${API_BASE_URL}/policy/admin/${id}`);
  return response.data;
};
