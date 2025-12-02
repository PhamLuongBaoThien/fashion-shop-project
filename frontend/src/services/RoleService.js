import { axiosJWT } from "./UserService"; 

const API_BASE_URL = process.env.REACT_APP_API_KEY;

// 2. Bỏ tham số access_token và headers
export const getAllRoles = async () => {
    const res = await axiosJWT.get(`${API_BASE_URL}/role/get-all`);
    return res.data;
};

export const createRole = async (data) => {
    const res = await axiosJWT.post(`${API_BASE_URL}/role/create`, data);
    return res.data;
};

export const updateRole = async (id, data) => {
    const res = await axiosJWT.put(`${API_BASE_URL}/role/update/${id}`, data);
    return res.data;
};

export const deleteRole = async (id) => {
    const res = await axiosJWT.delete(`${API_BASE_URL}/role/delete/${id}`);
    return res.data;
};