import { useEffect } from "react";
import { Form, Checkbox } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import "./SignInComponent.css";
import { Link } from "react-router-dom";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";
import InputComponent from "../../common/InputComponent/InputComponent";
import * as UserService from "../../../services/UserService";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutationHooks } from "../../../hooks/useMutationHook";
import { useMessageApi } from "../../../context/MessageContext";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../../redux/slides/userSlide";
import { clearCart, setCart } from "../../../redux/slides/cartSlide";
import * as CartService from "../../../services/CartService";
import { persistor } from "../../../redux/store";

const SignInComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useMessageApi();
  const dispatch = useDispatch();
  // Gọi API qua mutation hook
  const mutation = useMutationHooks((data) => UserService.loginUser(data));
  const { data, isPending, isSuccess, isError, error } = mutation;

  // 1. LẤY GIỎ HÀNG "KHÁCH" TỪ REDUX
  const guestCart = useSelector((state) => state.cart);

  useEffect(() => {
    const handGetDetailUser = async (id, token) => {
      const res = await UserService.getDetailUser(id);
      // console.log('res', res);
      dispatch(updateUser({ ...res?.data, access_token: token }));
      return res?.data;
    };

    // 2. Tạo một hàm async riêng để xử lý logic khi thành công
    const handleLoginSuccess = async (loginData) => {
      if (loginData.status === "OK" && loginData?.data?.access_token) {
        // --- ĐĂNG NHẬP THÀNH CÔNG ---
        const newAccessToken = loginData.data.access_token;
        showSuccess(loginData.message || "Đăng nhập thành công!");
        localStorage.setItem("access_token", JSON.stringify(newAccessToken));
        const decoded = jwtDecode(newAccessToken);
        if (decoded?.id) {
          // A. Lấy thông tin user
          const userDetails = await handGetDetailUser(
            decoded.id,
            newAccessToken
          );

          // KIỂM TRA VAI TRÒ (ROLE) TRƯỚC TIÊN
          if (userDetails?.isAdmin) {
            // --- LUỒNG 1: LÀ ADMIN ---
            // 1. (Tùy chọn) Dọn dẹp giỏ hàng "khách" nếu admin lỡ tay thêm
            if (guestCart.cartItems.length > 0) {
              dispatch(clearCart());
            }
            // 2. Điều hướng
            navigate("/system/admin"); // Admin vào trang Admin
          } else {
            await persistor.pause();
            // --- LUỒNG 2: LÀ KHÁCH HÀNG (CUSTOMER) ---

            // B. "PHÉP THUẬT" GỘP GIỎ HÀNG (PHẦN 3)
            const localCartItems = guestCart.cartItems;
            if (localCartItems.length > 0) {
              try {
                await CartService.mergeCart({ items: localCartItems });
                dispatch(clearCart());
                await persistor.purge();
              } catch (mergeError) {
                console.error("Lỗi gộp giỏ hàng:", mergeError);
                showError("Đã xảy ra lỗi khi gộp giỏ hàng của bạn.");
              }
            } // C. Tải giỏ hàng "thật" (đã gộp) từ DB về Redux

            try {
              const cartFromDB = await CartService.getCart();
              if (cartFromDB.status === "OK") {
                dispatch(setCart(cartFromDB.data.items));
              }
            } catch (cartError) {
              console.error("Lỗi tải giỏ hàng:", cartError);
            }

            // D. Điều hướng
            if (location.state) {
              navigate(location.state);
            } else {
              navigate("/"); // User về trang chủ
            }
          }
        }
      } else if (data.status === "ERR") {
        // --- ĐĂNG NHẬP THẤT BẠI (Sai pass, v.v.) ---
        showError(data.message || "Email hoặc mật khẩu không đúng!");
      }
    };

    // Khi mutation có phản hồi
    // 3. Xử lý logic chung của useEffect
    if (isSuccess && data) {
      handleLoginSuccess(data); // Gọi hàm async vừa tạo
    } else if (isError && error) {
      // Lỗi hệ thống (server không phản hồi hoặc hỏng)
      if (error.response && error.response.data) {
        showError(error.response.data.message || "Yêu cầu không hợp lệ!");
      } else {
        showError("Không thể kết nối đến server!");
      }
    }
  }, [
    isSuccess,
    isError,
    data,
    error,
    dispatch,
    navigate,
    showSuccess,
    showError,
  ]);

  const onFinish = (values) => {
    mutation.mutate(values);
  };
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <>
      <div className="auth-form-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập để tiếp tục mua sắm</p>
          </div>

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <InputComponent
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                    size="large"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                  ]}
                >
                  <InputComponent
                    type={"password"}
                    prefix={<LockOutlined />}
                    placeholder="••••••••"
                    size="large"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants} className="auth-form-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ</Checkbox>
                </Form.Item>
                <Link to="#" className="auth-forgot-link">
                  Quên mật khẩu?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item>
                  <ButtonComponent
                    size="large"
                    textButton="Đăng nhập"
                    styleButton={{
                      width: "100%",
                      borderRadius: "8px",
                      background: "#2d2d2d",
                      border: "none",
                    }}
                    htmlType="submit"
                    loading={isPending}
                    block
                    className="auth-submit-btn"
                  />
                </Form.Item>
              </motion.div>
            </Form>

            <motion.div variants={itemVariants} className="auth-toggle">
              <span>Chưa có tài khoản?</span>
              <Link to="/sign-up" className="auth-toggle-btn">
                Đăng ký ngay
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SignInComponent;
