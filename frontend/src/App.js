import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/layout/DefaultComponent/DefaultComponent";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
import * as UserService from "./services/UserService";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "./redux/slides/userSlide";
import { store } from "./redux/store";
import { Spin } from "antd";
import { MessageProvider } from "./context/MessageContext";

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user); // state.user là slice bạn đã tạo

  const handGetDetailUser = async (id) => {
    try {
      const res = await UserService.getDetailUser(id); // Gọi không cần token
      if (res?.status === "OK") {
        // Lấy token từ localStorage để đảm bảo luôn là token mới nhất
        const token = localStorage.getItem("access_token");
        dispatch(updateUser({ ...res?.data, access_token: JSON.parse(token) }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("handGetDetailUser error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { decoded } = handleDecoded();
    if (decoded?.id) {
      handGetDetailUser(decoded?.id);
    } else {
      setIsLoading(false); // 4. Dừng loading nếu không có token (không có user)
    }
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
      let { storageData, decoded } = handleDecoded();
      if (decoded?.exp < currentTime.getTime() / 1000) {
        try {
          const data = await UserService.refreshToken();
          const newAccessToken = data?.access_token;
          if (newAccessToken) {
            localStorage.setItem(
              "access_token",
              JSON.stringify(newAccessToken)
            );

            // Lấy state user hiện tại trực tiếp từ store
            const currentUserState = store.getState().user;

            // Tạo một payload hoàn chỉnh: state cũ + token mới
            // Quan trọng: map lại state.id vào _id để reducer nhận đúng
            const fullPayload = {
              ...currentUserState,
              _id: currentUserState.id,
              access_token: newAccessToken,
            };

            // Dispatch payload hoàn chỉnh này
            dispatch(updateUser(fullPayload));

            storageData = newAccessToken;
          }
        } catch (err) {
          console.error("Failed to refresh token", err);
        }
      }

      // 3. LUÔN LUÔN gắn token vào header trước khi gửi đi
      if (storageData) {
        config.headers["token"] = `Bearer ${storageData}`;
      }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  return (
    <MessageProvider>
    <div>
      {/* 5. Hiển thị Spin hoặc Router dựa trên state isLoading */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Router>
          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const Layout = route.isShowHeader
                ? DefaultComponent
                : React.Fragment;

              // Render route bình thường nếu không có children
              if (route.isPrivate && !user.isAdmin) {
                return null; // Trang cho admin, nhưng
              }

              // SỬA LẠI: Nếu route có children, tạo một Route cha lồng các con
              if (route.children) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Layout>
                        <Page />
                      </Layout>
                    }
                  >
                    {route.children.map((childRoute) => {
                      if (childRoute.isPrivate && !user.isAdmin) {
                        return null;
                      }

                      const ChildPage = childRoute.page;
                      return (
                        <Route
                          key={childRoute.path}
                          path={childRoute.path}
                          element={<ChildPage />}
                        />
                      );
                    })}
                  </Route>
                );
              }

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
      )}
    </div>
    </MessageProvider>
  );
}
export default App;
