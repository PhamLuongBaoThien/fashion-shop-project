import { useState, useEffect, useMemo } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // 1. Import useQuery
import * as ProductService from "../../services/ProductService"; // 2. Import ProductService
import * as CategoryService from "../../services/CategoryService";
import { useSearchParams, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Search } = Input;

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDeleteManyModalOpen, setIsDeleteManyModalOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1; // Đọc 'page' từ URL
  const limit = Number(searchParams.get("limit")) || 10; // Đọc 'limit' từ URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const sortOption = searchParams.get("sortOption") || "default";

  const queryClient = useQueryClient();
  
  const { messageApi } = useMessageApi();

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
      ProductService.getAllProducts({
        page,
        limit,
        search,
        category: category === "all" ? null : category,
        sortOption,
      }),
    retry: 3,
    retryDelay: 1000,
    keepPreviousData: true, // Giữ lại dữ liệu cũ khi đang fetch dữ liệu mới, tránh màn hình nháy
  });

  // MUTATION CHO VIỆC XUẤT EXCEL
  const exportMutation = useMutation({
    mutationFn: (params) => ProductService.getAllProducts(params),
    onSuccess: (data) => {
      messageApi.loading({ content: "Đang tạo file Excel...", key: "export" }); // DÙNG messageApi
      // Lấy toàn bộ sản phẩm từ kết quả API
      const productsToExport = data?.data || [];

      // Định dạng lại dữ liệu cho dễ đọc
      const formattedData = productsToExport.map((product) => {
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        return {
          "ID Sản phẩm": product._id,
          "Tên Sản phẩm": product.name,
          "Danh mục": product.category?.name,
          "Giá gốc (VNĐ)": product.price,
          "Giảm giá (%)": product.discount,
          "Giá bán (VNĐ)": finalPrice,
          "Tình trạng kho": product.inventoryStatus,
          "Hiển thị": product.isActive ? "Đang hoạt động" : "Ngừng",
          "Ngày tạo": new Date(product.createdAt).toLocaleString("vi-VN"),
        };
      });

      // Tạo file Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSanPham"); // Tên của sheet

      // Tải file về máy
      XLSX.writeFile(workbook, "DanhSachSanPham.xlsx");
      messageApi.success({
        content: "Xuất file Excel thành công!",
        key: "export",
        duration: 2,
      });
    },
    onError: (error) => {
      messageApi.error({
        content: `Xuất file thất bại: ${error.response.data.message || error.message}`,
        key: "export",
        duration: 2,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      return ProductService.deleteProduct(id);
    },
    onSuccess: () => {
      messageApi.success("Xóa sản phẩm thành công!");
      // Ra lệnh đi lấy lại danh sách sản phẩm mới nhất
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      messageApi.error(`Xóa thất bại: ${error.response.data.message || error.message}`);
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

  const deleteManyMutation = useMutation({
    mutationFn: (ids) => ProductService.deleteManyProducts(ids),
    onSuccess: () => {
      messageApi.success("Đã xóa các sản phẩm đã chọn!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setSelectedRowKeys([]); // Xóa các lựa chọn sau khi xóa thành công
    },
    onError: (error) => messageApi.error(error.response.data.message || error.message),
  });

  const handleDeleteManyProducts = () => {
    setIsDeleteManyModalOpen(true);
  };

  const confirmDeleteMany = () => {
    deleteManyMutation.mutate(selectedRowKeys);
    setIsDeleteManyModalOpen(false);
  };

  const cancelDeleteMany = () => {
    setIsDeleteManyModalOpen(false);
  };

  // Tách dữ liệu sản phẩm và thông tin phân trang
  const products = useMemo(() => data?.data, [data]);
  const totalProducts = useMemo(() => data?.pagination?.total, [data]);

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
    {
      title: "Danh mục",
      dataIndex: ["category", "name"], // Ra lệnh: vào 'category', rồi lấy 'name'
      key: "category",
    },
    {
      title: "Giá gốc",
      dataIndex: "price",
      key: "price",
      render: (price) => (price ? `${price.toLocaleString()}đ` : "0đ"),
    },
    {
      title: "Giá bán",
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
      title: "Người tạo",
      dataIndex: ["createdBy", "username"], // Lấy record.createdBy.username
      key: "createdBy",
      render: (username) => username || "Không rõ", // Hiển thị 'Không rõ' nếu thiếu
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/system/admin/products/update/${record._id}`}>
            <ButtonComponent type="primary" size="small" icon={<EditOutlined />} />
          </Link>
          <ButtonComponent
            danger
            type="primary"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      console.log("Selected products:", newSelectedRowKeys); // DEBUG
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  // HÀM XỬ LÝ KHI NHẤN NÚT XUẤT FILE
  const handleExportExcel = () => {
    messageApi.loading({
      content: "Đang tải dữ liệu...",
      key: "export",
      duration: 0,
    });
    // Gọi API để lấy TẤT CẢ sản phẩm (page 1, limit = tổng số sản phẩm)
    // với các bộ lọc hiện tại
    exportMutation.mutate({
      page: 1,
      limit: totalProducts > 0 ? totalProducts : 1000, // Lấy tất cả
      search,
      category: category === "all" ? null : category,
      sortOption,
    });
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
      <Alert messageApi="Lỗi" description={error.response.data.message || error.messagee} type="error" showIcon />
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

      {/* MODAL XÁC NHẬN XÓA NHIỀU */}
      <Modal
        title={`Xác nhận xóa ${selectedRowKeys.length} sản phẩm`}
        open={isDeleteManyModalOpen}
        onOk={confirmDeleteMany}
        onCancel={cancelDeleteMany}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteManyMutation.isPending}
      >
        <p>Bạn có chắc chắn muốn xóa {selectedRowKeys.length} sản phẩm này?</p>
        <p>
          <strong>Hành động này không thể hoàn tác.</strong>
        </p>
      </Modal>
      {/* NỘI DUNG CHÍNH CỦA TRANG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="admin-page-header">
            <h1>Quản lý Sản phẩm</h1>
            <ButtonComponent
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              loading={exportMutation.isPending}
              style={{ backgroundColor: "#10893E", borderColor: "#10893E" }}
            >
              Xuất Excel
            </ButtonComponent>
            <Link to="/system/admin/products/add">
              <ButtonComponent type="primary" icon={<PlusOutlined />} textButton={"Thêm Sản phẩm"} />

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <Space wrap>
                <Select
                  defaultValue={category}
                  style={{ width: 200 }}
                  onChange={handleCategoryChange}
                  loading={isLoadingCategories}
                  options={[
                    { value: "all", label: "Tất cả Danh mục" },
                    ...(categoriesData?.data?.map((cat) => ({
                      label: cat.name,
                      value: cat.slug,
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
              {/* NÚT XÓA NHIỀU */}
              {hasSelected && (
                <ButtonComponent
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteManyProducts}
                  loading={deleteManyMutation.isPending}
                  textButton={`Xóa ${selectedRowKeys.length} mục`}
                />

              )}
            </div>
          </Space>

          <Table
            rowSelection={rowSelection}
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
