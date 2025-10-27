// src/services/ExternalApiService.js
import axios from 'axios';

const publicApi = axios.create({
  baseURL: "https://provinces.open-api.vn/api",
  // ✅ THÊM DÒNG NÀY ĐỂ GHI ĐÈ QUY TẮC CHUNG
  withCredentials: false 
});

export const getProvinces = async () => {
  const res = await publicApi.get('/p/');
  return res.data;
};

export const getDistricts = async (provinceCode) => {
  const res = await publicApi.get(`/p/${provinceCode}?depth=2`);
  return res.data.districts || [];
};

export const getWards = async (districtCode) => {
  const res = await publicApi.get(`/d/${districtCode}?depth=2`);
  return res.data.wards || [];
};