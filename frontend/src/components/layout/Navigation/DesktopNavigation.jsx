import { Space } from "antd";
import { Link } from "react-router-dom";
import "./Navigation.css";

const DesktopNavigation = ({ navigationItems }) => {
  const navLinkStyle = {
    color: "#595959",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "color 0.2s ease",
    padding: "8px 16px",
  };

  return (
    <nav className="desktop-nav">
      <Space size="large">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            to={item.href} // Thay href bằng to
            style={navLinkStyle}
            onMouseEnter={(e) => (e.target.style.color = "#fa8c16")}
            onMouseLeave={(e) => (e.target.style.color = "#595959")}
          >
            {item.label}
          </Link>
        ))}
      </Space>
    </nav>
  );
};

export default DesktopNavigation;
