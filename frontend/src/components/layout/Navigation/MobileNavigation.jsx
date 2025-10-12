import { Drawer, Space } from 'antd'
import "./Navigation.css"
import { Link } from 'react-router-dom'


const MobileNavigation = ({ navigationItems, isOpen, onClose }) => {
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
              className="mobile-menu-link"
              onClick={onClose}
              onMouseEnter={(e) => (e.target.style.color = "#fa8c16")}
              onMouseLeave={(e) => (e.target.style.color = "#595959")}
            >
              {item.label}
            </Link>
          ))}
        </Space>
      </Drawer>
  )
}

export default MobileNavigation