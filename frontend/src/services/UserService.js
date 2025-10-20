import axios from "axios";

export const loginUser = async (data) => {
const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/sign-in`, data);
    return response.data;
}

export const createUser = async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/sign-up`, data);
    return response.data;
}