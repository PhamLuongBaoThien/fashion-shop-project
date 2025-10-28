"use client"

import { useState } from "react"
import { Table, Button, Tag, Space, Card } from "antd"
import { EyeOutlined, EditOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminOrders = () => {
  const [orders] = useState([
    { id: "ORD001", customer: "John Doe", amount: 1250000, status: "Delivered", date: "2024-01-15" },
    { id: "ORD002", customer: "Jane Smith", amount: 890000, status: "Shipped", date: "2024-01-14" },
    { id: "ORD003", customer: "Bob Johnson", amount: 2100000, status: "Pending", date: "2024-01-13" },
    { id: "ORD004", customer: "Alice Brown", amount: 650000, status: "Canceled", date: "2024-01-12" },
  ])

  const statusColors = {
    Pending: "orange",
    Shipped: "blue",
    Delivered: "green",
    Canceled: "red",
  }

  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amount) => `${amount.toLocaleString()}đ` },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />} />
          <Button size="small" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <div className="admin-page-header">
          <h1>Manage Orders</h1>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="admin-table"
        />
      </Card>
    </motion.div>
  )
}

export default AdminOrders
