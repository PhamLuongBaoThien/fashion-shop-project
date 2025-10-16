"use client";

import { useState } from "react";
import { Form, Checkbox, message } from "antd";
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
// import "./SignUpComponent.css"

const SignUpComponent = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    setTimeout(() => {
      message.success("Đăng ký thành công!");
      setLoading(false);
    }, 1500);
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
    <div className="auth-page">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-left-content">
          <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.div
            className="auth-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            D.E
          </motion.div>
          </Link>
          <motion.p
            className="auth-left-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Bắt đầu hành trình thời trang của bạn
          </motion.p>
        </div>
      </motion.div>

      <div className="auth-right">
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
                    name="fullName"
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
                        pattern: /^[0-9]{10}$/, // Kiểm tra số điện thoại 10 chữ số
                        message: "Số điện thoại phải là 10 chữ số!",
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
                      loading={loading}
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
      </div>
    </div>
  );
};

export default SignUpComponent;
