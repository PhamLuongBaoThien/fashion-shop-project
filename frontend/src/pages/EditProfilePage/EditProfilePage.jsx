"use client"

import { useState } from "react"
import { Form, Input, Button, Upload, Avatar, message, Row, Col, Select, DatePicker } from "antd"
import { CameraOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"
import { Link } from "react-router-dom";
import dayjs from "dayjs"
import "./EditProfile.css"

const EditProfile = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix")

  // Mock user data - trong thực tế sẽ lấy từ API/context
  const [user] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    gender: "Nam",
    dateOfBirth: "1995-05-15",
  })

  // Initialize form with user data
  useState(() => {
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
    })
  }, [])

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target.result)
        message.success("Cập nhật ảnh đại diện thành công!")
      }
      reader.readAsDataURL(info.file.originFileObj)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    console.log("[v0] Form values:", values)
    setTimeout(() => {
      message.success("Cập nhật thông tin thành công!")
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
    <motion.div
      className="edit-profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="edit-profile-header">
        <h1>Chỉnh sửa thông tin cá nhân</h1>
      </div>

      {/* Form Container */}
      <motion.div className="edit-profile-container" variants={formVariants} initial="hidden" animate="visible">
        {/* Avatar Section */}
        <motion.div className="avatar-section" variants={itemVariants}>
          <div className="avatar-container">
            <Avatar size={150} src={avatar} className="edit-avatar" />
            <Upload
              maxCount={1}
              accept="image/*"
              onChange={handleAvatarChange}
              showUploadList={false}
              className="avatar-upload"
            >
              <Button icon={<CameraOutlined />} className="upload-btn">
                Thay đổi ảnh
              </Button>
            </Upload>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div className="form-section" variants={itemVariants}>
          <Form
            form={form}
            name="editProfile"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="edit-form"
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                >
                  <Input placeholder="Nguyễn Văn A" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input placeholder="example@email.com" size="large" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="0912345678" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select
                    placeholder="Chọn giới tính"
                    size="large"
                    options={[
                      { label: "Nam", value: "Nam" },
                      { label: "Nữ", value: "Nữ" },
                      { label: "Khác", value: "Khác" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker placeholder="Chọn ngày sinh" size="large" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="address" label="Địa chỉ">
                  <Input placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM" size="large" />
                </Form.Item>
              </Col>
            </Row>

            {/* Buttons */}
            <div className="form-actions">
              <Link to="/profile">
                <Button size="large" className="cancel-btn">
                  Hủy
                </Button>
              </Link>
              <Button type="primary" htmlType="submit" size="large" loading={loading} className="submit-btn">
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default EditProfile
