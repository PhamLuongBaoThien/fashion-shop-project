import { useState } from "react"
import { Table, Button, Modal, Form, Input, InputNumber, Upload, Space, Tag, Card } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const AdminProducts = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Premium Linen Shirt", category: "Áo", price: 1290000, stock: 45, status: "Active" },
    { id: 2, name: "Cotton T-Shirt", category: "Áo", price: 590000, stock: 120, status: "Active" },
    { id: 3, name: "Casual Pants", category: "Quần", price: 890000, stock: 0, status: "Out of Stock" },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: "Product Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Price", dataIndex: "price", key: "price", render: (price) => `${price.toLocaleString()}đ` },
    { title: "Stock", dataIndex: "stock", key: "stock" },
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

  const handleAddProduct = () => {
    setIsModalOpen(true)
  }

  const handleModalOk = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <div className="admin-page-header">
          <h1>Manage Products</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="admin-table"
        />
      </Card>

      <Modal
        title="Add New Product"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Input placeholder="Select category" />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{ required: true }]}>
            <InputNumber placeholder="Enter price" />
          </Form.Item>

          <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
            <InputNumber placeholder="Enter stock quantity" />
          </Form.Item>

          <Form.Item label="Product Image" name="image">
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default AdminProducts
