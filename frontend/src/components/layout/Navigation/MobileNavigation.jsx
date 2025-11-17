import { Drawer, Space } from "antd";
import "./Navigation.css";
import { Link, useLocation } from "react-router-dom";

const MobileNavigation = ({ navigationItems, isOpen, onClose }) => {
  const location = useLocation(); // Lấy đối tượng location hiện tại
  return (
    <Drawer
      title="Menu"
      placement="right"
      onClose={onClose}
      open={isOpen}
      className="mobile-drawer"
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`mobile-menu-link ${
              location.pathname === item.href ? "active-link" : ""
            }`}
            onClick={onClose}

          >
            {item.label}
          </Link>
        ))}
      </Space>
    </Drawer>
  );
};

export default MobileNavigation;
