import React from "react";
import { Modal, Tabs, Typography, Form, Input, Button } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title } = Typography;


const AuthModal = ({ visible, onCancel, onLogin, onRegister }) => {
    const [loginForm] = Form.useForm(); 
    const [registerForm] = Form.useForm();
    

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={() => {
        onCancel();
        loginForm.resetFields();
        registerForm.resetFields();
      }}
      footer={null}
      width={480}
      centered
    >
      <Tabs
        defaultActiveKey="login"
        centered
        items={[
          {
            key: "login",
            label: "Đăng nhập",
            children: (
              <div style={{ padding: "24px 0" }}>
                <Title
                  level={3}
                  style={{
                    textAlign: "center",
                    marginBottom: "32px",
                    color: "#262626",
                  }}
                >
                  Chào mừng trở lại
                </Title>
                <Form
                  form={loginForm}
                  name="login"
                  onFinish={(values) => {
                    onLogin(values);
                    loginForm.resetFields();
                  }}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Mật khẩu"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <a
                        href="#"
                        style={{ color: "#fa8c16", fontSize: "14px" }}
                      >
                        Quên mật khẩu?
                      </a>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      style={{
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ),
          },
          {
            key: "register",
            label: "Đăng ký",
            children: (
              <div style={{ padding: "24px 0" }}>
                <Title
                  level={3}
                  style={{
                    textAlign: "center",
                    marginBottom: "32px",
                    color: "#262626",
                  }}
                >
                  Tạo tài khoản mới
                </Title>
                <Form
                  form={registerForm}
                  name="register"
                  onFinish={(values) => {
                    onRegister(values);
                    registerForm.resetFields();
                  }}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ tên!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Họ và tên"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Số điện thoại"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                      {
                        min: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Mật khẩu"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
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
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="Xác nhận mật khẩu"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      style={{
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Đăng ký
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default AuthModal;
