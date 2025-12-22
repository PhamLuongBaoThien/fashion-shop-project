import { axiosJWT } from "./UserService";

const API_BASE_URL = process.env.REACT_APP_API_KEY;

export const getDashboardStats = async (year, month) => {
    let url = `${API_BASE_URL}/dashboard/stats?year=${year}`;
    if (month) {
        url += `&month=${month}`;
    }
    // Gọi API lấy thống kê, token sẽ được interceptor tự gắn
    const res = await axiosJWT.get(url);
    return res.data;
};