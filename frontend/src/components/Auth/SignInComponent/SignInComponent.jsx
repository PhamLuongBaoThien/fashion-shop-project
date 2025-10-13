"use client"

import { useState } from "react"
import { Form, Checkbox, message } from "antd"
import { LockOutlined, MailOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"
import "./SignInComponent.css"
import { Link } from "react-router-dom"
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent"
import InputComponent from "../../common/InputComponent/InputComponent"


const SignInComponent = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    setTimeout(() => {
      message.success("Đăng nhập thành công!")
      setLoading(false)
    }, 1500)
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-left-content">
          <motion.div
            className="auth-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            D.E
          </motion.div>
          <motion.p
            className="auth-left-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Khám phá phong cách thời trang của riêng bạn
          </motion.p>
        </div>
      </motion.div>

      <div className="auth-right">
        <div className="auth-form-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="auth-header">
              <h1>Chào mừng trở lại</h1>
              <p>Đăng nhập để tiếp tục mua sắm</p>
            </div>

            <motion.div variants={formVariants} initial="hidden" animate="visible">
              <Form name="login" onFinish={onFinish} layout="vertical" requiredMark={false}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <InputComponent prefix={<MailOutlined />} placeholder="example@email.com" size="large" />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                  >
                    <InputComponent type={'password'} prefix={<LockOutlined />} placeholder="••••••••" size="large" />
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
                      styleButton={{ width: "100%", borderRadius: "8px", background: "#2d2d2d", border: "none" }}
                      htmlType="submit"
                      loading={loading}
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
      </div>
    </div>
  )
}

export default SignInComponent
