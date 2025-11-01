import { axiosJWT } from "./UserService"; // Hoặc import axios nếu không cần xác thực

export const getAllProducts = async (page = 1, limit = 10, search = "", category = null, sortOption = null) => {
    // Bắt đầu xây dựng chuỗi truy vấn với page và limit
    let queryString = `page=${page}&limit=${limit}`;

    // Nối thêm các tham số nếu chúng có giá trị
    if (search) {
        queryString += `&search=${search}`;
    }
    if (category) {
        queryString += `&category=${category}`;
    }
    if (sortOption) {
        queryString += `&sortOption=${sortOption}`;
    }

    const response = await axiosJWT.get(
        `${process.env.REACT_APP_API_KEY}/product/get-all?${queryString}`
    );
    return response.data;
};

export const createProduct = async (data) => {
    // data ở đây là một FormData object
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_KEY}/product/create`, data, {
        headers: {
            'Content-Type': 'multipart/form-data' // Header quan trọng để server hiểu
        }
    });
    return res.data; 
};

export const getDetailProduct = async (id) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_KEY}/product/detail/${id}`);
    return res.data;
};

export const updateProduct = async (id, data) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_KEY}/product/update/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};