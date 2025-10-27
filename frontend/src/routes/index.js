import HomePage from "../pages/HomePage/HomePage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage.jsx";
import EditProfilePage from "../pages/EditProfilePage/EditProfilePage.jsx";
import AdminPage from "../pages/AdminPage/AdminPage.jsx"

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
    path: "/product-detail",
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
    page: AdminPage,
    isShowHeader: false,
    isPrivate: true
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
