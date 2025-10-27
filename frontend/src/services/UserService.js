import axios from "axios";

axios.defaults.withCredentials = true;

export const axiosJWT = axios.create({ withCredentials: true });

export const loginUser = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/user/sign-in`,
    data
  );
  return response.data;
};

export const createUser = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/user/sign-up`,
    data
  );
  return response.data;
};

export const getDetailUser = async (id) => {
  const response = await axiosJWT.get(
    `${process.env.REACT_APP_API_KEY}/user/get-detail/${id}`,

  );
  return response.data;
};

export const refreshToken = async () => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/user/refresh-token`,
    {}, // body rỗng
    { withCredentials: true } // config đúng chỗ
  );
  return response.data;
};

export const logoutUser = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/user/log-out`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosJWT.put(
    `${process.env.REACT_APP_API_KEY}/user/update-user/${id}`,
    data
  );
  return response.data;
};

export const loginAdmin = async (data) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/user/admin/sign-in`,
    data
  );
  return response.data;
};