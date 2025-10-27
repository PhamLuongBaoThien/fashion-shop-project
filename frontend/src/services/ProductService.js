import axios from "axios";

export const getAllProducts = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all`);
    return response.data;
}