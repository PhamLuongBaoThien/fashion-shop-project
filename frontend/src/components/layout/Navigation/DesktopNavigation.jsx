import { Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";

const DesktopNavigation = ({ navigationItems }) => {
  const location = useLocation();

  const activeColor = "#fa8c16"; // Màu cam (màu của hover)
  const defaultColor = "#595959";

  const getNavLinkStyle = (href) => {
    // Kiểm tra xem đường dẫn hiện tại có khớp với đường dẫn của mục không
    const isActive = location.pathname === href;

    return {
      color: isActive ? activeColor : defaultColor, // Áp dụng màu active
      textDecoration: "none",
      fontWeight: "500",
      fontSize: "14px",
      transition: "color 0.2s ease",
      padding: "8px 16px",
    };
  };

  return (
    <nav className="desktop-nav">
      <Space size="large">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            to={item.href} // Thay href bằng to
            style={getNavLinkStyle(item.href)}
            onMouseEnter={(e) => (e.target.style.color = activeColor)}
            onMouseLeave={(e) => {
              // Nếu KHÔNG phải là trang active, quay lại màu default
              if (location.pathname !== item.href) {
                e.target.style.color = defaultColor;
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </Space>
    </nav>
  );
};

export default DesktopNavigation;
