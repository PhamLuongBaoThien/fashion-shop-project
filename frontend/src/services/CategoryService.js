import axios from "axios";
import { axiosJWT } from "./UserService"; // Hoặc axios thường nếu API get-all là public

export const getAllCategories = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/category/get-all`);
    return res.data;
};

export const createCategory = async (data) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_KEY}/category/create`, data);
    return res.data;
};

export const updateCategory = async (categoryId, data) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_KEY}/category/update/${categoryId}`, data);
    return res.data;
}

// Thêm các hàm update, delete 