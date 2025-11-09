import HomePage from "../pages/HomePage/HomePage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage.jsx";
import EditProfilePage from "../pages/EditProfilePage/EditProfilePage.jsx";
import AdminSignInPage from "../pages/AdminSignInPage/AdminSignInPage.jsx";
import AdminLayout from "../components/layout/Admin/AdminLayout.jsx";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard.jsx";
import AdminProducts from "../pages/AdminProducts/AdminProducts.jsx";
import AdminCategories from "../pages/AdminCategories/AdminCategories.jsx";
import AdminUsers from "../pages/AdminUsers/AdminUsers.jsx";
import AdminOrders from "../pages/AdminOrders/AdminOrders.jsx";
import AdminRoles from "../pages/AdminRoles/AdminRoles.jsx";
import AdminProfile from "../pages/AdminProfile/AdminProfile.jsx";
import AdminAddProductPage from "../pages/AdminProducts/AdminAddProduct.jsx";
import AdminUpdateProductPage from "../pages/AdminProducts/AdminUpdateProductPage.jsx";

export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/products",
    page: ProductsPage,
    isShowHeader: true,
  },
  {
    path: "/orders",
    page: OrderPage,
    isShowHeader: true,
  },
  {
    path: "/product/:slug", // Thay vì "/product-detail"
    page: ProductDetailPage,
    isShowHeader: true,
  },
  {
    path: "/sign-up",
    page: SignUpPage,
  },
  {
    path: "/sign-in",
    page: SignInPage,
  },
  {
    path: "/profile",
    page: ProfilePage,
    isShowHeader: true,
  },
  {
    path: "/edit-profile",
    page: EditProfilePage,
    isShowHeader: true,
  },
  {
    path: "/system/admin",
    page: AdminLayout,
    isShowHeader: false,
    isPrivate: true,
    children: [
      // Các trang con sẽ được hiển thị bên trong <Outlet />
      {
        path: "", // URL: /system/admin
        page: AdminDashboard,
      },
      {
        path: "products", // URL: /system/admin/products
        page: AdminProducts,
      },
      {
        path: "products/add", // URL: /system/admin/products
        page: AdminAddProductPage,
      },
      {
        path: "products/update/:id",
        page: AdminUpdateProductPage,
      },
      {
        path: "categories", // URL: /system/admin/users
        page: AdminCategories,
      },
      {
        path: "users", // URL: /system/admin/users
        page: AdminUsers,
      },
      {
        path: "orders", // URL: /system/admin/users
        page: AdminOrders,
      },
      {
        path: "roles", // URL: /system/admin/users
        page: AdminRoles,
      },
      {
        path: "profile", // URL: /system/admin/users
        page: AdminProfile,
      },
    ],
  },
  {
    path: "/admin/sign-in",
    page: AdminSignInPage,
    isShowHeader: false, // Trang login admin thường không có header/footer chung
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
