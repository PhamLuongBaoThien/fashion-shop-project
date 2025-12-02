"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Space,
  Card,
  Tag,
  Input,
  Button,
  Modal,
  Drawer,
  Tooltip,
  Form,
  Switch,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LockOutlined,
  UnlockOutlined,
  HistoryOutlined,
  DownloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom"; // Import hook này

import * as UserService from "../../services/UserService";
import * as OrderService from "../../services/OrderService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Search } = Input;

const AdminUsers = () => {
  const user = useSelector((state) => state.user);
  const { messageApi } = useMessageApi();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // 1. SỬ DỤNG useSearchParams
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. LẤY GIÁ TRỊ TỪ URL (Thay thế state cục bộ)
  // Nếu URL là ...?search=abc&role=admin -> Lấy 'abc' và 'admin'
  // Nếu không có thì lấy mặc định
  const searchText = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "all";

  // State Drawer & Modal (Giữ nguyên state cục bộ vì không cần đưa lên URL)
  const [isOpenHistoryDrawer, setIsOpenHistoryDrawer] = useState(false);
  const [userSelectedHistory, setUserSelectedHistory] = useState(null);
  const [isOpenEditDrawer, setIsOpenEditDrawer] = useState(false);
  const [stateUserDetails, setStateUserDetails] = useState(null);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [rowSelected, setRowSelected] = useState("");

  // --- 1. FETCH DATA ---
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UserService.getAllUser(user?.access_token),
    enabled: !!user?.access_token,
  });

  const { data: userOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["admin-user-orders", userSelectedHistory],
    queryFn: () =>
      OrderService.getOrdersByUserId(userSelectedHistory, user?.access_token),
    enabled: !!userSelectedHistory && !!user?.access_token,
  });

  // --- 2. MUTATIONS ---
  const mutationUpdate = useMutation({
    mutationFn: (data) => {
      const { id, ...rests } = data;
      return UserService.updateUser(id, rests, user?.access_token);
    },
    onSuccess: () => {
      messageApi.success("Cập nhật thành công!");
      queryClient.invalidateQueries(["admin-users"]);
      setIsOpenEditDrawer(false);
    },
    onError: (err) => messageApi.error(err.message || "Cập nhật thất bại!"),
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => UserService.deleteUser(id, user?.access_token),
    onSuccess: () => {
      messageApi.success("Xóa người dùng thành công!");
      queryClient.invalidateQueries(["admin-users"]);
      setIsModalOpenDelete(false);
    },
    onError: (err) => messageApi.error(err.message || "Xóa thất bại!"),
  });

  // --- 3. HANDLERS ---

  // Hàm xử lý khi thay đổi bộ lọc -> Cập nhật URL
  const handleSearch = (value) => {
    // Giữ lại các params cũ, chỉ update 'search'
    if (value) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search"); // Xóa nếu rỗng
    }
    setSearchParams(searchParams);
  };

  const handleRoleFilterChange = (value) => {
    if (value && value !== "all") {
      searchParams.set("role", value);
    } else {
      searchParams.delete("role");
    }
    setSearchParams(searchParams);
  };

  const handleBlockUser = (record) => {
    mutationUpdate.mutate({
      id: record._id,
      isBlocked: !record.isBlocked,
    });
  };

  const handleDetailsUser = (record) => {
    setStateUserDetails(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      isAdmin: record.isAdmin,
      gender: record.gender,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
    });
    setIsOpenEditDrawer(true);
  };

  const onFinishUpdate = (values) => {
    mutationUpdate.mutate({
      id: stateUserDetails._id,
      ...values,
    });
  };

  const handleDeleteUser = () => {
    mutationDelete.mutate(rowSelected);
  };

  const handleExportExcel = () => {
    // 1. Kiểm tra filteredData thay vì usersData
    if (!filteredData || filteredData.length === 0) {
      messageApi.warning("Không có dữ liệu để xuất");
      return;
    }

    // 2. Map từ filteredData
    const excel = filteredData.map((u) => ({
      ID: u._id,
      Username: u.username,
      Email: u.email,
      SĐT: u.phone,
      "Địa chỉ": [
        u.address?.detailAddress,
        u.address?.ward,
        u.address?.district,
        u.address?.province,
      ]
        .filter(Boolean)
        .join(", "),
      "Vai trò": u.isAdmin ? "Admin" : "Khách hàng",
      "Trạng thái": u.isBlocked ? "Đã khóa" : "Hoạt động",
      "Ngày tạo": new Date(u.createdAt).toLocaleDateString("vi-VN"),
    }));

    const ws = XLSX.utils.json_to_sheet(excel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachUser");
    XLSX.writeFile(wb, "DanhSachNguoiDung.xlsx");
  };

  // --- 4. FILTERS LOGIC (Lấy giá trị từ URL) ---
  const filteredData = useMemo(() => {
    // Bước 1: Lấy dữ liệu gốc, nếu chưa có thì gán mảng rỗng
    let data = usersData?.data || [];

    // Bước 2: Kiểm tra điều kiện TÌM KIẾM
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      // Giữ lại những user nào có Tên, Email hoặc SĐT chứa từ khóa
      data = data.filter(
        (item) =>
          (item.username || "").toLowerCase().includes(lowerSearch) ||
          (item.email || "").toLowerCase().includes(lowerSearch) ||
          (item.phone || "").includes(lowerSearch)
      );
    }

    // Bước 3: Kiểm tra điều kiện VAI TRÒ
    if (roleFilter !== "all") {
      const isAdminFilter = roleFilter === "admin"; // true nếu chọn Admin
      // Giữ lại user có isAdmin khớp với lựa chọn
      data = data.filter((item) => item.isAdmin === isAdminFilter);
    }

    // Bước 4: Trả về danh sách cuối cùng
    return data;

    // useMemo sẽ chạy lại logic này mỗi khi 1 trong 3 cái này thay đổi:
  }, [usersData, searchText, roleFilter]);

  // --- 5. COLUMNS ---
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      render: (phone) => phone || "---",
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_, record) => {
        const addr = record.address || {};
        return addr.province || "Chưa cập nhật";
      },
    },
    {
      title: "Vai trò",
      dataIndex: "isAdmin",
      render: (isAdmin) => (
        <Tag color={isAdmin ? "volcano" : "green"}>
          {isAdmin ? "ADMIN" : "CUSTOMER"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isBlocked",
      render: (isBlocked) => (
        <Tag color={isBlocked ? "red" : "blue"}>
          {isBlocked ? "Bị Khóa" : "Hoạt Động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          {!record.isAdmin && (
            <Tooltip title="Lịch sử đơn hàng">
              <ButtonComponent
                type="default"
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => {
                  setUserSelectedHistory(record._id);
                  setIsOpenHistoryDrawer(true);
                }}
              />
            </Tooltip>
          )}

          <Tooltip title="Sửa thông tin">
            <ButtonComponent
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleDetailsUser(record)}
            />
          </Tooltip>

          {!record.isAdmin && (
            <Tooltip title={record.isBlocked ? "Mở khóa" : "Khóa"}>
              <ButtonComponent
                danger={!record.isBlocked}
                type={record.isBlocked ? "primary" : "default"}
                style={
                  record.isBlocked
                    ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
                    : {}
                }
                size="small"
                icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
                onClick={() => handleBlockUser(record)}
              />
            </Tooltip>
          )}

          {!record.isAdmin && (
            <Tooltip title="Xóa người dùng">
              <ButtonComponent
                danger
                type="primary"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  setRowSelected(record._id);
                  setIsModalOpenDelete(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id) => <b>#{id.slice(-6).toUpperCase()}</b>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (price) => price?.toLocaleString("vi-VN") + "đ",
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      render: (paid) =>
        paid ? (
          <Tag color="green">Đã TT</Tag>
        ) : (
          <Tag color="orange">Chưa TT</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => <Tag>{status}</Tag>,
    },
  ];

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
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            Quản lý Người dùng
          </h1>
          <ButtonComponent
            type="primary"
            style={{ backgroundColor: "#10893E", borderColor: "#10893E" }}
            icon={<DownloadOutlined />}
            textButton="Xuất Excel"
            onClick={handleExportExcel}
          />
        </div>

        <div style={{ marginBottom: 24, display: "flex", gap: "16px" }}>
          <Search
            placeholder="Tìm kiếm user..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            defaultValue={searchText} // Giá trị mặc định lấy từ URL
            onSearch={handleSearch} // Gọi hàm cập nhật URL khi bấm Enter hoặc nút Search
            style={{ width: 300 }}
          />
          <Select
            defaultValue={roleFilter} // Giá trị mặc định lấy từ URL
            style={{ width: 150, height: 40 }}
            onChange={handleRoleFilterChange} // Gọi hàm cập nhật URL khi chọn
            options={[
              { value: "all", label: "Tất cả vai trò" },
              { value: "admin", label: "Admin" },
              { value: "customer", label: "Khách hàng" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="admin-table"
          loading={isLoading}
          scroll={{ x: true }}
        />

        {/* --- DRAWER LỊCH SỬ ĐƠN HÀNG --- */}
        <Drawer
          title="Lịch sử mua hàng"
          placement="right"
          onClose={() => {
            setIsOpenHistoryDrawer(false);
            setUserSelectedHistory(null);
          }}
          open={isOpenHistoryDrawer}
          width={700}
        >
          <Table
            columns={orderColumns}
            dataSource={userOrders?.data || []}
            rowKey="_id"
            loading={isLoadingOrders}
            pagination={{ pageSize: 5 }}
          />
        </Drawer>

        {/* --- DRAWER CHỈNH SỬA THÔNG TIN --- */}
        <Drawer
          title="Chỉnh sửa thông tin người dùng"
          placement="right"
          onClose={() => setIsOpenEditDrawer(false)}
          open={isOpenEditDrawer}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={onFinishUpdate}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled style={{ color: "#888" }} />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Giới tính" name="gender">
                  <Select
                    options={[
                      { value: "male", label: "Nam" },
                      { value: "female", label: "Nữ" },
                      { value: "other", label: "Khác" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày sinh" name="dateOfBirth">
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <div
              style={{
                marginTop: 20,
                padding: "15px",
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 500 }}>Quyền Quản trị (Admin)</span>
                <Form.Item name="isAdmin" valuePropName="checked" noStyle>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </div>
              <div style={{ fontSize: 12, color: "#faad14", marginTop: 8 }}>
                ⚠️ Cảnh báo: User này sẽ có toàn quyền truy cập vào trang quản
                trị hệ thống.
              </div>
            </div>

            <Form.Item style={{ marginTop: 30 }}>
              <ButtonComponent
                type="primary"
                htmlType="submit"
                textButton="Cập nhật"
                block
                loading={mutationUpdate.isPending}
              />
            </Form.Item>
          </Form>
        </Drawer>

        {/* MODAL XÓA USER */}
        <Modal
          title="Xác nhận xóa người dùng"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={handleDeleteUser}
          okText="Xóa"
          okButtonProps={{ danger: true, loading: mutationDelete.isPending }}
        >
          <p>Bạn có chắc chắn muốn xóa tài khoản này không?</p>
          <p style={{ color: "red" }}>
            Lưu ý: Hành động này không thể hoàn tác!
          </p>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default AdminUsers;
