"use client"

import { useState } from "react"
import { Table, Button, Tag, Space, Card } from "antd"
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminUsers = () => {
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Customer", status: "Inactive" },
  ])

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role", render: (role) => <Tag>{role}</Tag> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
    },
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
          <h1>Manage Users</h1>
        </div>

        <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} className="admin-table" />
      </Card>
    </motion.div>
  )
}

export default AdminUsers
