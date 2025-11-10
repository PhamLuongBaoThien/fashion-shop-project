import { useEffect } from "react";
import { Form, Checkbox } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import "./SignInComponent.css";
import { Link } from "react-router-dom";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";
import InputComponent from "../../common/InputComponent/InputComponent";
import * as UserService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useMutationHooks } from "../../../hooks/useMutationHook";
import { useMessageApi } from "../../../context/MessageContext";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../../redux/slides/userSlide";

const SignInComponent = () => {
  const navigate = useNavigate();
const { showSuccess, showError } = useMessageApi();
  const dispatch = useDispatch();
  // Gọi API qua mutation hook
  const mutation = useMutationHooks((data) => UserService.loginUser(data));
  const { data, isPending, isSuccess, isError, error } = mutation;

  useEffect(() => {
    const handGetDetailUser = async (id, token) => {
        const res = await UserService.getDetailUser(id);
        // console.log('res', res);
        dispatch(updateUser({...res?.data, access_token: token}));
    }
    // Khi mutation có phản hồi
    if (isSuccess && data) {
      // Trường hợp login thành công thật sự
      if (data.status === "OK" && data?.data?.access_token) {
        const newAccessToken = data.data.access_token;
        showSuccess(data.message || "Đăng nhập thành công!");
        // Lưu token
        localStorage.setItem("access_token", JSON.stringify(newAccessToken));
        if (newAccessToken) {
          const decoded = jwtDecode(newAccessToken);
          // console.log("decoded", decoded);
          if(decoded?.id){
            handGetDetailUser(decoded?.id, newAccessToken);
          }
        }

        // Redirect về trang chủ
        navigate("/");
      }
      // Trường hợp lỗi đăng nhập (sai email hoặc password)
      else if (data.status === "ERR") {
        showError(data.message || "Email hoặc mật khẩu không đúng!");
      }
    }

    

    // Lỗi hệ thống (server không phản hồi hoặc hỏng)
    if (isError && error) {
      //isError trả về true khi có lỗi xảy ra, error chứa thông tin lỗi
      if (error.response && error.response.data) {
        showError(error.response.data.message || "Yêu cầu không hợp lệ!");
      } else {
        showError("Không thể kết nối đến server!");
      }
    }
    
  }, [isSuccess, isError, data, navigate, showSuccess, showError, error, dispatch]);

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
