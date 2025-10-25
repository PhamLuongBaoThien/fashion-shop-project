import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/layout/DefaultComponent/DefaultComponent";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
import * as UserService from "./services/UserService";
import { useDispatch } from "react-redux";
import { updateUser } from "./redux/slides/userSlide";

function App() {
  const dispatch = useDispatch();
  const handGetDetailUser = async (id, token) => {
    if (!token) {
      return;
    }
    const res = await UserService.getDetailUser(id, token);
    // console.log('res', res);
    dispatch(updateUser({ ...res?.response?.data, access_token: token }));
  };

  useEffect(() => {
    const { storageData, decoded } = handleDecoded();
    if (decoded?.id) {
      handGetDetailUser(decoded?.id, storageData);
    }
    console.log("storageData", storageData);
  }, []);

  const handleDecoded = () => {
    let storageData = localStorage.getItem("access_token");
    let decoded = {};
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }

    return { decoded, storageData };
  };

  UserService.axiosJWT.interceptors.request.use(
    async function (config) {
      const currentTime = new Date();
      const { decoded } = handleDecoded();
      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await UserService.refreshToken();
        config.headers["token"] = `Bearer ${data?.response?.access_token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // Sử dụng useQuery để lấy dữ liệu sản phẩm
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const apiUrl = process.env.REACT_APP_API_KEY; // Sử dụng biến đúng
      // console.log("Requesting URL:", `${apiUrl}/product/get-all`);
      const res = await axios.get(`${apiUrl}/product/get-all`);
      // console.log("API Response:", res.data); // Debug response
      return res.data; // Điều chỉnh dựa trên cấu trúc API
    },
    retry: 1, // Thử lại 1 lần nếu lỗi
    staleTime: 5000, // Dữ liệu giữ mới trong 5 giây
  });

  // Log trạng thái để debug
  // console.log("Query state:", { data, isLoading, isError, error });

  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page;
            const Layout = route.isShowHeader
              ? DefaultComponent
              : React.Fragment;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}
export default App;
