import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderComponent from "../HeaderComponent/HeaderComponent";
import FooterComponent from "../FooterComponent/FooterComponent";
import BreadcrumbComponent from "../../common/BreadcrumbComponent/BreadcrumbComponent";

const DefaultComponent = ({ children }) => {
  const { pathname } = useLocation();
  
  // Kiểm tra xem có phải trang chủ không
  const isHomePage = pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" }); // hoặc "smooth"
  }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <HeaderComponent />
      <div style={{ marginTop: isHomePage ? "0" : "80px", flex: 1 }}>
        {/* Hiển thị Breadcrumb ngay dưới Header */}
        <BreadcrumbComponent />
        {children}
        <FooterComponent />
      </div>
    </div>
  );
};

export default DefaultComponent;
