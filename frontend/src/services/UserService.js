import axios from "axios";

export const loginUser = async (data) => {
const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/sign-in`, data);
    return response.data;
}

export const createUser = async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/sign-up`, data);
    return response.data;
}

export const getDetailUser = async (id, access_token) => {
  const response = await axios.get(`${process.env.REACT_APP_API_KEY}/user/get-detail/${id}`, {
    headers: { token: `Bearer ${access_token}` }
  });
  return response.data;
}