import { Card, Form, Input, Button, Upload, Avatar, Space } from "antd"
import { UploadOutlined, UserOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminProfile = () => {
  const [form] = Form.useForm()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card title="Admin Profile" className="profile-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div className="profile-avatar-section">
            <Avatar size={100} icon={<UserOutlined />} />
            <Upload>
              <Button icon={<UploadOutlined />}>Change Avatar</Button>
            </Upload>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item label="Current Password" name="currentPassword">
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item label="New Password" name="newPassword">
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item label="Confirm Password" name="confirmPassword">
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>

            <Button type="primary" size="large">
              Save Changes
            </Button>
          </Form>
        </Space>
      </Card>
    </motion.div>
  )
}

export default AdminProfile
