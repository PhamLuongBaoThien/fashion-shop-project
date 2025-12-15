import { axiosJWT } from "./UserService";

const API_BASE_URL = process.env.REACT_APP_API_KEY;

export const getDashboardStats = async (access_token) => {
    // Gọi API lấy thống kê, token sẽ được interceptor tự gắn
    const res = await axiosJWT.get(`${API_BASE_URL}/dashboard/stats`);
    return res.data;
};