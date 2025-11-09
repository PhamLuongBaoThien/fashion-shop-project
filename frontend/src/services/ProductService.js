import { axiosJWT } from "./UserService"; // Hoặc import axios nếu không cần xác thực
import axios from "axios";

export const getAllProducts = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    sortOption,
    priceRange,
    sizes,
    status,
    isActive,
  } = params;

  let queryString = `page=${page}&limit=${limit}`;

  if (search) {
    queryString += `&search=${encodeURIComponent(search)}`;
  }
  if (sortOption) {
    queryString += `&sortOption=${encodeURIComponent(sortOption)}`;
  }

  // 1. Nếu category là một mảng (từ trang Customer)
  if (Array.isArray(category) && category.length > 0) {
    queryString += `&category=${encodeURIComponent(category.join(","))}`;
  }
  // 2. Nếu category là một chuỗi (từ trang Admin)
  else if (typeof category === "string" && category) {
    queryString += `&category=${encodeURIComponent(category)}`;
  }

  // Các bộ lọc khác giữ nguyên
  if (Array.isArray(priceRange) && priceRange.length > 0) {
    queryString += `&priceRange=${encodeURIComponent(priceRange.join(","))}`;
  }
  if (Array.isArray(sizes) && sizes.length > 0) {
    queryString += `&sizes=${encodeURIComponent(sizes.join(","))}`;
  }

  if (Array.isArray(status) && status.length > 0) {
    queryString += `&status=${encodeURIComponent(status.join(","))}`;
  }

  if (isActive !== undefined) {
    queryString += `&isActive=${encodeURIComponent(isActive)}`;
  }

  const response = await axios.get(
    `${process.env.REACT_APP_API_KEY}/product/get-all?${queryString}`
  );
  return response.data;
};

export const createProduct = async (data) => {
  // data ở đây là một FormData object
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_KEY}/product/create`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data", // Header quan trọng để server hiểu
      },
    }
  );
  return res.data;
};

export const getDetailProduct = async (id) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_KEY}/product/detail/${id}`
  );
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_KEY}/product/update/${id}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axiosJWT.delete(
    `${process.env.REACT_APP_API_KEY}/product/delete/${id}`
  );
  return res.data;
};

export const deleteManyProducts = async (ids) => {
  // Gửi một mảng các ID lên body
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_KEY}/product/delete-many`,
    { ids }
  );
  return res.data;
};

export const getDetailProductBySlug = async (slug) => {
  try {
  // API endpoint này bạn đã tạo ở backend
  const res = await axios.get(
    `${process.env.REACT_APP_API_KEY}/product/detail-by-slug/${slug}`
  );
// Backend trả về { status: "ERR" } khi không tìm thấy
    if (res.data.status === 'ERR') {
      // Ném ra một lỗi tùy chỉnh để useQuery bắt
      const error = new Error(res.data.message);
      error.name = 'NotFoundError'; // Đặt tên cho lỗi
      throw error;
    }
    
    return res.data;

  } catch (axiosError) {
    // Xử lý các lỗi mạng hoặc 500 từ server
    console.error("Lỗi API:", axiosError);
    throw axiosError; // Ném lỗi gốc của axios ra
  }
};

export const getRelatedProducts = async ({ slug, pageParam = 1, limit = 4 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/related/${slug}?page=${pageParam}&limit=${limit}`);
    return res.data; // Trả về toàn bộ response { status, data, pagination }
};
