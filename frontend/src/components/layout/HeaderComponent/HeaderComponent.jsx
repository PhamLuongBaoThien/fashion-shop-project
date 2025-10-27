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
import { Link, Navigate } from "react-router-dom";
import "./HeaderComponent.css";
import Logo from "../../common/Logo/Logo";
import DesktopNavigation from "../Navigation/DesktopNavigation";
// import AuthModal from "./AuthModal";
import MobileNavigation from "../Navigation/MobileNavigation";
// import DesktopSearch from "../InputSearch/DesktopSearch";
// import MobileSearch from "../InputSearch/MobileSearch";
import InputSearch from "../../common/InputSearch/InputSearch";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { logoutUser } from "../../../redux/slides/userSlide"; // tí mình sẽ tạo action này
import * as UserService from "../../../services/UserService";
import { resetUser } from "../../../redux/slides/userSlide";

const { Header } = Layout;

export default function HeaderComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user); // state.user là slice bạn đã tạo
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await UserService.logoutUser();
    localStorage.removeItem("access_token");
    dispatch(resetUser());
    navigate("/sign-in");
  };

  const getLastName = (fullName) => {
    if (!fullName) return "Khách";
    const nameParts = fullName.trim().split(" ");
    return nameParts[nameParts.length - 1]; // Lấy phần cuối
  };

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

  const userMenu = {
    items: user.isAdmin
      ? [
          // Mảng dành cho ADMIN
          
          {
            key: "profile",
            label: (
              <Link to="/profile" style={{ fontWeight: 500, color: "#262626" }}>
                Thông tin cá nhân
              </Link>
            ),
          },
          { type: "divider" },
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
          },
          { type: "divider" },
          {
            key: "admin",
            label: (
              <Link
                to="/system/admin"
                style={{ fontWeight: 600, color: "#1890ff" }}
              >
                Quản lý hệ thống
              </Link>
            ),
          },
          
        ]
      : [
          // Mảng dành cho CUSTOMER
          {
            key: "profile",
            label: (
              <Link to="/profile" style={{ fontWeight: 500, color: "#262626" }}>
                Thông tin cá nhân
              </Link>
            ),
          },
          { type: "divider" },
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
          },
        ],
  };


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
            placeholder={
              user.username
                ? `${getLastName(user.username)} cần tìm gì?`
                : "Tìm kiếm sản phẩm..."
            }
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
            menu={user && user.email ? userMenu : authMenu}
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
          <Badge
            count={1}
            size="medium"
            color="#fa8c16"
            overflowCount={99}
            className="cart-badge"
          >
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
