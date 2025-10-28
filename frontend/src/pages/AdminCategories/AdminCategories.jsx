"use client"

import { useState } from "react"
import { Table, Button, Modal, Form, Input, Space, Card } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminCategories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Áo", description: "Clothing items", productCount: 234 },
    { id: 2, name: "Quần", description: "Pants and shorts", productCount: 156 },
    { id: 3, name: "Giày", description: "Footwear", productCount: 89 },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: "Category Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Products", dataIndex: "productCount", key: "productCount" },
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
          <h1>Manage Categories</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Category
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="admin-table"
        />
      </Card>

      <Modal
        title="Add New Category"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Category Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default AdminCategories
