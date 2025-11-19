import { useState } from "react";
import { Layout, Menu, Button, Dropdown, Avatar, Space, Drawer } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./admin.css";

import { useSelector, useDispatch } from "react-redux";
import * as UserService from "../../../services/UserService";
import { resetUser } from "../../../redux/slides/userSlide";
import { clearCart } from "../../../redux/slides/cartSlide";
import { persistor } from "../../../redux/store";

const { Sider, Content, Header } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation(); // LẤY VỊ TRÍ HIỆN TẠI
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await UserService.logoutUser();
    localStorage.removeItem("access_token");
    dispatch(resetUser());
    dispatch(clearCart());
    await persistor.purge(); // Xóa toàn bộ dữ liệu đã lưu của redux-persist

    // Bật lại (resume) bộ theo dõi cho khách vãng lai tiếp theo
    persistor.persist();

    navigate("/sign-in");
  };

  const menuItems = [
    {
      key: "/system/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/system/admin">Tổng quan</Link>,
    },
    {
      key: "/system/admin/products",
      icon: <ShoppingOutlined />,
      label: <Link to="/system/admin/products">Sản phẩm</Link>,
    },
    {
      key: "/system/admin/categories",
      icon: <UnorderedListOutlined />,
      label: <Link to="/system/admin/categories">Danh mục</Link>,
    },
    {
      key: "/system/admin/orders",
      icon: <ShoppingOutlined />,
      label: <Link to="/system/admin/orders">Đơn hàng</Link>,
    },
    {
      key: "/system/admin/users",
      icon: <UserOutlined />,
      label: <Link to="/system/admin/users">Người dùng</Link>,
    },
    {
      key: "/system/admin/roles",
      icon: <SafetyOutlined />,
      label: <Link to="/system/admin/roles">Quyền & Phân Quyền</Link>,
    },
    {
      key: "/system/admin/profile",
      icon: <SettingOutlined />,
      label: <Link to="/system/admin/profile">Thông tin tài khoản</Link>,
    },
  ];

  const userMenu = [
    {
      key: "profile",
      label: (
        <Link
          to="/system/admin/profile"
          style={{ fontWeight: 500, color: "#262626" }}
        >
          Thông tin tài khoản
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <span
          style={{ fontWeight: 500, color: "red", cursor: "pointer" }}
          onClick={handleLogout}
        >
          Đăng xuất
        </span>
      ),
      // icon: <LogoutOutlined />,
    },
  ];

  return (
    <Layout className="admin-layout">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
        width={250}
      >
        <motion.div
          className="admin-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="logo-text">D.E</h1>
          {!collapsed && <p className="logo-subtitle">Admin</p>}
        </motion.div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]} // Thêm prop này để Menu được điều khiển bởi URL
          items={menuItems}
          className="admin-menu"
        />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        className="admin-drawer"
      >
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={() => setMobileDrawerOpen(false)}
        />
      </Drawer>

      <Layout className="admin-main-layout">
        {/* Header */}
        <Header className="admin-header">
          <motion.div
            className="admin-header-content"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuOutlined /> : <CloseOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="admin-toggle-btn"
            />

            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className="admin-mobile-menu-btn"
            />

            <Space className="admin-header-right">
              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  className="admin-avatar"
                />
              </Dropdown>
            </Space>
          </motion.div>
        </Header>

        {/* Content */}
        <Content className="admin-content">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
