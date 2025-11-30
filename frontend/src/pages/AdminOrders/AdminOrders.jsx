"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Space,
  Card,
  Input,
  Select,
  Modal,
  Spin,
  Alert,
  Tag,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useSelector } from "react-redux"; // Đã kích hoạt
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import * as XLSX from "xlsx"; // Đã kích hoạt

import * as OrderService from "../../services/OrderService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Search } = Input;

const AdminOrders = () => {
  const user = useSelector((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Lấy messageApi từ context
  const { messageApi } = useMessageApi();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  // Lấy params từ URL
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const sortOption = searchParams.get("sortOption") || "newest";
  const statusFilter = searchParams.get("status") || "all";

  // --- 1. FETCH DATA ---
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-orders", page, limit, search, sortOption, statusFilter],
    queryFn: () => OrderService.getAllOrders(user?.access_token),
    enabled: !!user?.access_token,
    select: (data) => {
      let filtered = data.data || [];

      // Lọc theo Search (Mã đơn, Tên KH, SĐT)
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            (order._id && order._id.toLowerCase().includes(lowerSearch)) ||
            (order.customerInfo?.fullName &&
              order.customerInfo.fullName
                .toLowerCase()
                .includes(lowerSearch)) ||
            (order.customerInfo?.phone &&
              order.customerInfo.phone.includes(search))
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }

      // Sắp xếp
      if (sortOption === "newest") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortOption === "oldest") {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortOption === "price_desc") {
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
      } else if (sortOption === "price_asc") {
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
      }

      return filtered;
    },
  });

  // Tách dữ liệu phân trang
  const paginatedOrders = useMemo(() => {
    if (!ordersData) return [];
    const startIndex = (page - 1) * limit;
    return ordersData.slice(startIndex, startIndex + limit);
  }, [ordersData, page, limit]);

  const totalOrders = ordersData?.length || 0;

  // --- 2. HANDLERS ---

  const handleTableChange = (pagination) => {
    setSearchParams({
      page: pagination.current,
      limit: pagination.pageSize,
      search,
      sortOption,
      status: statusFilter,
    });
  };

  const handleStatusFilterChange = (value) => {
    setSearchParams({ status: value, page: 1, limit, search, sortOption });
  };

  const onSearch = (value) => {
    setSearchParams({
      search: value,
      page: 1,
      limit,
      sortOption,
      status: statusFilter,
    });
  };

  const handleSortChange = (value) => {
    setSearchParams({
      sortOption: value,
      page: 1,
      limit,
      search,
      status: statusFilter,
    });
  };

  const handleDeleteOrder = (id) => {
    setDeletingOrderId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (messageApi)
      messageApi.info(
        "Tính năng xóa đơn hàng đang phát triển (API chưa sẵn sàng)"
      );
    setIsDeleteModalOpen(false);
  };

  // --- HÀM XUẤT EXCEL (HOẠT ĐỘNG THẬT) ---
  const handleExportExcel = () => {
    if (!ordersData || ordersData.length === 0) {
      if (messageApi) messageApi.warning("Không có dữ liệu để xuất");
      return;
    }

    if (messageApi)
      messageApi.loading({ content: "Đang tạo file Excel...", key: "export" });

    try {
      // 1. Format dữ liệu cho Excel
      const formattedData = ordersData.map((order) => ({
        "Mã đơn": order._id,
        "Ngày đặt": new Date(order.createdAt).toLocaleDateString("vi-VN"),
        "Người đặt": order.customerInfo?.fullName,
        "SĐT người đặt": order.customerInfo?.phone,
        "Người nhận": order.shippingInfo?.fullName,
        "SĐT người nhận": order.shippingInfo?.phone,
        "Địa chỉ giao": `${order.shippingInfo?.detailAddress}, ${order.shippingInfo?.ward}, ${order.shippingInfo?.district}, ${order.shippingInfo?.province}`,
        "Tổng tiền": order.totalPrice,
        "Trạng thái giao hàng": getStatusLabel(order.status),
        "Trạng thái thanh toán": order.isPaid
          ? "Đã thanh toán"
          : "Chưa thanh toán",
      }));

      // 2. Tạo Worksheet và Workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DonHang");

      // 3. Xuất file
      XLSX.writeFile(workbook, "DanhSachDonHang.xlsx");

      // 4. Thông báo thành công
      if (messageApi)
        messageApi.success({
          content: "Xuất file Excel thành công!",
          key: "export",
          duration: 2,
        });
    } catch (error) {
      console.error("Export error:", error);
      if (messageApi)
        messageApi.error({
          content: "Xuất file thất bại!",
          key: "export",
          duration: 2,
        });
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
        return "Đã xác nhận";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao thành công";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chờ xử lý";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "confirmed":
        return "geekblue";
      case "shipped":
        return "blue";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // --- 3. COLUMNS DEFINITION ---
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
          #{id ? id.slice(-6).toUpperCase() : "NA"}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerInfo",
      key: "customer",
      render: (customerInfo, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 500 }}>
            {customerInfo?.fullName || "Guest"}
          </span>
          <span style={{ fontSize: "12px", color: "#888" }}>
            {customerInfo?.phone}
          </span>

          {record.shippingInfo?.fullName !== customerInfo?.fullName && (
            <Tooltip
              title={`Người nhận: ${record.shippingInfo?.fullName} - ${record.shippingInfo?.phone}`}
            >
              <Tag
                color="purple"
                style={{
                  marginTop: 4,
                  width: "fit-content",
                  fontSize: 10,
                  cursor: "help",
                }}
                icon={<UserOutlined />}
              >
                Mua tặng
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "amount",
      render: (amount) => (
        <span style={{ fontWeight: 600, color: "#c92127" }}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount || 0)}
        </span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => (
        <div style={{ fontSize: "13px" }}>
          <div>{date ? new Date(date).toLocaleDateString("vi-VN") : ""}</div>
          <div style={{ color: "#999" }}>
            {date ? new Date(date).toLocaleTimeString("vi-VN") : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            <Tag color={getStatusColor(record.status || "pending")}>
              {getStatusLabel(record.status || "pending")}
            </Tag>

            {record.isPaid ? (
              <Tag color="success">Đã thanh toán</Tag>
            ) : (
              <Tag color="warning">Chưa thanh toán</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "payment",
      render: (method) => (
        <Tag color={method === "cod" ? "cyan" : "purple"}>
          {method === "cod" ? "COD" : method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/system/admin/order/${record._id}`}>
            <ButtonComponent
              type="primary"
              size="small"
              icon={<EyeOutlined />}
            />
          </Link>

          <ButtonComponent
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteOrder(record._id)}
          />
        </Space>
      ),
    },
  ];

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
      <Alert
        message="Lỗi"
        description={error?.message || "Không thể tải danh sách đơn hàng"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div
          className="admin-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1>Quản lý Đơn hàng</h1>
          <ButtonComponent
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            style={{ backgroundColor: "#10893E", borderColor: "#10893E" }}
            textButton={"Xuất Excel"}
          />
        </div>

        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <Search
              placeholder="Tìm theo Mã đơn, Tên KH, SĐT..."
              onSearch={onSearch}
              enterButton
              defaultValue={search}
              style={{ width: 300 }}
            />

            <Space wrap>
              <Select
                value={statusFilter}
                style={{ width: 150 }}
                onChange={handleStatusFilterChange}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "pending", label: "Chờ xử lý" },
                  { value: "confirmed", label: "Đã xác nhận" },
                  { value: "shipped", label: "Đang giao" },
                  { value: "delivered", label: "Đã giao" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
              />
              <Select
                value={sortOption}
                style={{ width: 200 }}
                onChange={handleSortChange}
                options={[
                  { value: "newest", label: "Mới nhất" },
                  { value: "oldest", label: "Cũ nhất" },
                  { value: "price_desc", label: "Giá: Cao đến Thấp" },
                  { value: "price_asc", label: "Giá: Thấp đến Cao" },
                ]}
              />
            </Space>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={paginatedOrders}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: totalOrders,
            showSizeChanger: true,
            position: ["bottomCenter"],
          }}
          onChange={handleTableChange}
          className="admin-table"
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Xác nhận xóa đơn hàng"
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn xóa đơn hàng này không?</p>
        <p style={{ fontSize: "12px", color: "#888" }}>
          Lưu ý: Hiện tại chỉ là giao diện, chức năng xóa chưa được kích hoạt.
        </p>
      </Modal>
    </motion.div>
  );
};

export default AdminOrders;
