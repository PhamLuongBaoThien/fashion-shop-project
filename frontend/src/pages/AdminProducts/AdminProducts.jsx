import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Space,
  Tag,
  Card,
  Spin,
  Alert,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query"; // 1. Import useQuery
import * as ProductService from "../../services/ProductService"; // 2. Import ProductService
import { useSearchParams } from "react-router-dom";

const { Search } = Input;

const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1; // Đọc 'page' từ URL
  const limit = Number(searchParams.get("limit")) || 10; // Đọc 'limit' từ URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const sortOption = searchParams.get("sortOption") || "default";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]); // Lắng nghe sự thay đổi của 'page'

  const { data, isLoading, isError, error } = useQuery({
    // queryKey bao gồm cả pagination để tự động fetch lại khi chuyển trang
    queryKey: ["admin-products", page, limit, search, category, sortOption],
    queryFn: () =>
      ProductService.getAllProducts(
        page,
        limit,
        search,
        category === "all" ? null : category,
        sortOption
      ),
    retry: 3,
    retryDelay: 1000,
    keepPreviousData: true, // Giữ lại dữ liệu cũ khi đang fetch dữ liệu mới, tránh màn hình nháy
  });

  // Tách dữ liệu sản phẩm và thông tin phân trang từ response
  const products = data?.response?.data;
  const totalProducts = data?.response?.pagination?.total;

  const handleTableChange = (pagination) => {
    // Cập nhật URL thay vì cập nhật state
    setSearchParams({
      page: pagination.current,
      limit: pagination.pageSize,
      search: search, // Giữ lại search khi chuyển trang
      category: category,
      sortOption: sortOption,
    });
  };

  const onSearch = (value) => {
    setSearchParams({
      search: value,
      page: 1, // Luôn quay về trang 1 khi tìm kiếm
      limit: limit,
      category: category,
      sortOption: sortOption,
    });
  };

  const handleCategoryChange = (value) => {
    setSearchParams({ category: value, page: 1, limit, search, sortOption });
  };

  const handleSortChange = (value) => {
    setSearchParams({ sortOption: value, page: 1, limit, search, category });
  };

  const columns = [
    { title: "Tên Sản phẩm", dataIndex: "name", key: "name" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (price ? `${price.toLocaleString()}đ` : "0đ"),
    },
    // { title: "Tồn kho", dataIndex: "stock", key: "stock" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Còn hàng" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} />
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // 5. Xử lý trạng thái Loading và Lỗi
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (isError) {
    return (
      <Alert message="Lỗi" description={error.message} type="error" showIcon />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="admin-page-header">
          <h1>Quản lý Sản phẩm</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Thêm Sản phẩm
          </Button>
        </div>

        {/* THÊM BỘ LỌC VÀO GIAO DIỆN */}
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <Search
            placeholder="Tìm kiếm theo tên sản phẩm..."
            onSearch={onSearch}
            enterButton
            defaultValue={search}
          />
          <Space wrap>
            <Select
              defaultValue={category}
              style={{ width: 200 }}
              onChange={handleCategoryChange}
              options={[
                { value: "all", label: "Tất cả Danh mục" },
                { value: "Áo", label: "Áo" },
                { value: "Quần", label: "Quần" },
                { value: "Áo khoác", label: "Áo khoác" },
                { value: "Đầm", label: "Đầm" },
              ]}
            />
            <Select
              defaultValue={sortOption}
              style={{ width: 200 }}
              onChange={handleSortChange}
              options={[
                { value: "default", label: "Sắp xếp Mặc định" },
                { value: "price_asc", label: "Giá: Thấp đến Cao" }, 
                { value: "price_desc", label: "Giá: Cao đến Thấp" },
                { value: "name_asc", label: "Tên: A-Z" },
                { value: 'name_desc', label: 'Tên: Z-A' },
              ]}
            />
            {/* Thêm các bộ lọc khác ở đây nếu cần */}
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id" // 6. Sửa rowKey thành "_id" để khớp với MongoDB
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: totalProducts,
          }}
          onChange={handleTableChange}
          className="admin-table"
        />
      </Card>

      <Modal
        title="Thêm Sản phẩm mới"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Sản phẩm"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true }]}
          >
            <Input placeholder="Chọn danh mục" />
          </Form.Item>
          <Form.Item label="Giá" name="price" rules={[{ required: true }]}>
            <InputNumber placeholder="Nhập giá" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Tồn kho" name="stock" rules={[{ required: true }]}>
            <InputNumber
              placeholder="Nhập số lượng tồn kho"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Ảnh Sản phẩm" name="image">
            <Upload>
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AdminProducts;
