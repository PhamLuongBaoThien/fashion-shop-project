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