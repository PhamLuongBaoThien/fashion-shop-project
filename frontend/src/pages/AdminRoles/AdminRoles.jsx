"use client"

import { useState } from "react"
import { Table, Button, Modal, Form, Input, Checkbox, Space, Card } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminRoles = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: "Super Admin", permissions: "All", users: 1 },
    { id: 2, name: "Product Manager", permissions: "Manage Products", users: 3 },
    { id: 3, name: "Order Manager", permissions: "Manage Orders", users: 2 },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: "Role Name", dataIndex: "name", key: "name" },
    { title: "Permissions", dataIndex: "permissions", key: "permissions" },
    { title: "Users", dataIndex: "users", key: "users" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} />
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <div className="admin-page-header">
          <h1>Manage Roles & Permissions</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Role
          </Button>
        </div>

        <Table columns={columns} dataSource={roles} rowKey="id" pagination={{ pageSize: 10 }} className="admin-table" />
      </Card>

      <Modal
        title="Add New Role"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Role Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Form.Item label="Permissions" name="permissions">
            <Checkbox.Group
              options={[
                { label: "Manage Products", value: "products" },
                { label: "Manage Orders", value: "orders" },
                { label: "Manage Users", value: "users" },
                { label: "Manage Roles", value: "roles" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default AdminRoles
