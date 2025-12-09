"use client";

import { useEffect } from "react";
import { Form, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";
import InputComponent from "../../common/InputComponent/InputComponent";
import * as UserService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useMutationHooks } from "../../../hooks/useMutationHook";
import { useMessageApi } from "../../../context/MessageContext";
import "./SignUpComponent.css";

const SignUpComponent = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useMessageApi();

  // Gọi API qua mutation hook
  const mutation = useMutationHooks((data) => UserService.createUser(data));
  const { data, isPending, isSuccess, isError, error } = mutation;

  useEffect(() => {
    // Khi mutation có phản hồi
    if (isSuccess && data) {
      // Trường hợp login thành công thật sự
      if (data.status === "OK") {
        showSuccess(data.message || "Đăng ký thành công!");


        // Redirect về trang chủ
        navigate("/sign-in");
      }
      // Trường hợp lỗi đăng nhập (sai email hoặc password)
      else if (data.status === "ERR") {
        showError(data.message || "Đã xảy ra lỗi khi đăng ký!");
      }
    }

    // Lỗi hệ thống (server không phản hồi hoặc hỏng)
    if (isError && error) { //isError trả về true khi có lỗi xảy ra, error chứa thông tin lỗi
      if (error.response && error.response.data) {
        showError(error.response.data.message || "Yêu cầu không hợp lệ!");
      } else {
        showError("Không thể kết nối đến server!");
      }
    }
  }, [isSuccess, isError, data, navigate, showSuccess, showError, error]);

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
            <h1>Tạo tài khoản</h1>
            <p>Đăng ký để trải nghiệm mua sắm tuyệt vời</p>
          </div>

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="username"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                  ]}
                >
                  <InputComponent
                    prefix={<UserOutlined />}
                    placeholder="Nguyễn Văn A"
                  />
                </Form.Item>
              </motion.div>

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
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại!",
                    },
                    {
                      pattern: /^(84|0[3|5|7|8|9])[0-9]{8}$/, // Kiểm tra số điện thoại 10 chữ số
                      message: "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số bắt đầu bằng 03, 05, 07, 08 hoặc 09 và có 10 - 11 số!",
                    },
                  ]}
                >
                  <InputComponent
                    prefix={<PhoneOutlined />}
                    placeholder="0901234567"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <InputComponent
                    type={"password"}
                    prefix={<LockOutlined />}
                    placeholder="••••••••"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <InputComponent
                    type={"password"}
                    prefix={<LockOutlined />}
                    placeholder="••••••••"
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Vui lòng đồng ý với điều khoản")
                            ),
                    },
                  ]}
                >
                  <Checkbox>
                    Tôi đồng ý với <Link to="#">Điều khoản</Link>
                  </Checkbox>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item>
                  <ButtonComponent
                    size="large"
                    textButton="Đăng ký"
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
                  >
                    Đăng ký
                  </ButtonComponent>
                </Form.Item>
              </motion.div>
            </Form>

            <motion.div variants={itemVariants} className="auth-toggle">
              <span>Đã có tài khoản?</span>
              <Link to="/sign-in" className="auth-toggle-btn">
                Đăng nhập
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SignUpComponent;
