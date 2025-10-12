import { useState, useEffect } from "react";
import {
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { Badge, Layout, Space, Dropdown } from "antd";
import { Link } from "react-router-dom";
import "./HeaderComponent.css";
import Logo from "../../common/Logo/Logo";
import DesktopNavigation from "../Navigation/DesktopNavigation";
// import AuthModal from "./AuthModal";
import MobileNavigation from "../Navigation/MobileNavigation";
// import DesktopSearch from "../InputSearch/DesktopSearch";
// import MobileSearch from "../InputSearch/MobileSearch";
import InputSearch from "../../common/InputSearch/InputSearch";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";

const { Header } = Layout;

export default function HeaderComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Tin tức", href: "/news" },
    // { label: "Giới thiệu", href: "/about" },
    { label: "Liên hệ", href: "/contact" },
  ];

  const headerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: isScrolled
      ? "rgba(250, 250, 250, 0.8)"
      : "rgba(250, 250, 250, 0.5)",
    backdropFilter: isScrolled ? "blur(12px)" : "none",
    borderBottom: isScrolled ? "1px solid #f0f0f0" : "none",
    transition: "all 0.3s ease",
    padding: "0 24px",
    height: "80px",
    lineHeight: "80px",
  };

  // Menu cho Dropdown
  const authMenu = {
    items: [
      {
        key: "login",
        label: (
          <Link to="/sign-in" style={{ fontWeight: 500, color: "#262626" }}>
            Đăng nhập
          </Link>
        ),
      },
      {
        type: "divider",
      },
      {
        key: "register",
        label: (
          <Link to="/sign-up" style={{ fontWeight: 500, color: "#262626" }}>
            Đăng ký
          </Link>
        ),
      },
    ],
  };

  // const handleLogin = (values) => {
  //   console.log("Login values:", values);
  // };

  // const handleRegister = (values) => {
  //   console.log("Register values:", values);
  // };

  return (
    <Header style={headerStyle}>
      <div className="header-container">
        {/* Logo */}
        <div>
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation navigationItems={navigationItems} />

        {/* Mobile Navigation */}
        <MobileNavigation
          navigationItems={navigationItems}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Side Icons */}
        <Space size="middle">
          {/* Desktop Search */}
          <InputSearch
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="desktop-search"
          />

          {/* Mobile Search Toggle */}
          <ButtonComponent
            type="text"
            size="large"
            className="mobile-search-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            icon={<SearchOutlined />}
          />

          {/* Wishlist */}
          <ButtonComponent
            type="text"
            size="large"
            className="wishlist-btn"
            icon={<HeartOutlined />}
          />

          {/* Account */}
          <Dropdown
            menu={authMenu}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <ButtonComponent
              type="text"
              size="large"
              className="account-btn"
              icon={<UserOutlined />}
            />
          </Dropdown>

          {/* Shopping Cart */}
          <Badge count={1} size="medium" color="#fa8c16" overflowCount={99} className="cart-badge">
            <ButtonComponent
              type="text"
              size="large"
              className="cart-btn"
              icon={<ShoppingCartOutlined />}
            />
          </Badge>

          {/* Mobile Menu Toggle */}
          <ButtonComponent
            type="text"
            size="large"
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            icon={isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          />
        </Space>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <InputSearch
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          // width="100%"
          className="mobile-search-bar"
        />
      )}
    </Header>
  );
}
