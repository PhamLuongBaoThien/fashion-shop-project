import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Tag,
  Card,
  Spin,
  Alert,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // 1. Import useQuery
import * as ProductService from "../../services/ProductService"; // 2. Import ProductService
import * as CategoryService from "../../services/CategoryService";
import { useSearchParams, Link } from "react-router-dom";

const { Search } = Input;

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const page = Number(searchParams.get("page")) || 1; // Đọc 'page' từ URL
  const limit = Number(searchParams.get("limit")) || 10; // Đọc 'limit' từ URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const sortOption = searchParams.get("sortOption") || "default";

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

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

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      return ProductService.deleteProduct(id);
    },
    onSuccess: () => {
      message.success("Xóa sản phẩm thành công!");
      // Ra lệnh đi lấy lại danh sách sản phẩm mới nhất
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      message.error(`Xóa thất bại: ${error.message}`);
    },
  });

  const handleDeleteProduct = (productId) => {
    console.log("Bước 1: handleDeleteProduct được gọi với ID:", productId);
    setDeletingProductId(productId);
    setIsDeleteModalOpen(true); // HIỆN MODAL
  };

  const confirmDelete = () => {
    console.log(
      "Bước 2: Xác nhận xóa → gọi mutation với ID:",
      deletingProductId
    );
    deleteMutation.mutate(deletingProductId);
    setIsDeleteModalOpen(false);
  };

  const cancelDelete = () => {
    console.log("Hủy xóa");
    setIsDeleteModalOpen(false);
    setDeletingProductId(null);
  };

  // Tách dữ liệu sản phẩm và thông tin phân trang
  const products = data?.data;
  const totalProducts = data?.pagination?.total;

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
    {
      title: "Giá sau khi giảm",
      key: "finalPrice",
      // `record` ở đây là nguyên object của một sản phẩm
      render: (_, record) => {
        // Tính giá cuối cùng
        const finalPrice = record.price * (1 - (record.discount || 0) / 100);

        return (
          <strong style={{ color: "#c92127" }}>
            {finalPrice.toLocaleString()}đ
          </strong>
        );
      },
    },
    // { title: "Tồn kho", dataIndex: "stock", key: "stock" },
    {
      title: "Tình trạng kho",
      dataIndex: "inventoryStatus", // Đọc từ trường đã tính toán
      key: "inventoryStatus",
      render: (status) => (
        <Tag color={status === "Còn hàng" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hiển thị",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "blue" : "default"}>
          {isActive ? "Đang hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/system/admin/products/update/${record._id}`}>
            <Button type="primary" size="small" icon={<EditOutlined />} />
          </Link>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record._id)}
            loading={
              deleteMutation.isPending &&
              deleteMutation.variables === record._id
            }
          />
        </Space>
      ),
    },
  ];

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
    <>
      {/* MODAL XÁC NHẬN XÓA */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteMutation.isPending}
      >
        <p>
          Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này{" "}
          <strong>không thể hoàn tác</strong>.
        </p>
      </Modal>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="admin-page-header">
            <h1>Quản lý Sản phẩm</h1>
            <Link to="/system/admin/products/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm Sản phẩm
              </Button>
            </Link>
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
                loading={isLoadingCategories}
                options={[
                  { value: "all", label: "Tất cả Danh mục" },
                  // Map qua dữ liệu từ API
                  ...(categoriesData?.data?.map((cat) => ({
                    label: cat.name,
                    value: cat.slug, // Giá trị là ID
                  })) || []),
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
                  { value: "name_desc", label: "Tên: Z-A" },
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
      </motion.div>
    </>
  );
};

export default AdminProducts;
