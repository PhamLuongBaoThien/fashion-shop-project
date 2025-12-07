"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Space,
  Card,
  Tag,
  Input,
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
  UserAddOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHooks } from "../../hooks/useMutationHook";

import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom"; // Import hook này

import * as UserService from "../../services/UserService";
import * as RoleService from "../../services/RoleService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import UserHistoryDrawer from "./UserHistoryDrawer";

const { Search } = Input;

const AdminUsers = () => {
  const user = useSelector((state) => state.user);
  const { messageApi } = useMessageApi();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [formCreate] = Form.useForm();

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

  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);

  const isAdminWatchingEdit = Form.useWatch("isAdmin", form);
  const isAdminWatchingCreate = Form.useWatch("isAdmin", formCreate);

  // --- 1. FETCH DATA ---
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UserService.getAllUser(user?.access_token),
    enabled: !!user?.access_token,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles-list"],
    queryFn: () => RoleService.getAllRoles(),
    enabled: !!user?.access_token,
  });

  // Tìm xem Role của người đang đăng nhập là Role nào trong danh sách rolesData
  console.log("--- DEBUG ROLE ---");
  console.log("User Role trong Redux:", user?.role);
  console.log("Danh sách Roles API:", rolesData?.data);

  const currentUserRole = rolesData?.data?.find(
    (r) => r._id === user?.role || r._id === user?.role?._id
  );
  console.log("Tìm thấy Role:", currentUserRole);
  // 1. Xác định TRÙM CUỐI (Chỉ Owner hoặc người giữ chức Super Admin)
  const isSuperAdmin =
    user?.email === process.env.REACT_APP_ADMIN_MAIL || // Email cứng
    currentUserRole?.name === "Super Admin";
  // 2. Xác định ai được PHÉP QUẢN LÝ (Để hiện khung UI)
  // Bao gồm Trùm cuối HOẶC Admin thường có quyền 'system'
  const canManageRoles =
    isSuperAdmin ||
    (user?.isAdmin &&
      (currentUserRole?.permissions?.includes("system") ||
        currentUserRole?.permissions?.includes("user"))); // Cho phép người có quyền 'user' được sửa role

  // 3. LỌC DANH SÁCH ROLE (Quan trọng nhất)
  const availableRolesOptions = rolesData?.data
    ?.filter((r) => {
      if (canManageRoles && user?.email === process.env.REACT_APP_ADMIN_MAIL) return true; // Chủ sở hữu thấy hết
      return r.name !== "Super Admin"; // Các Admin khác ko thấy Super Admin
    })
    .map((r) => ({ label: r.name, value: r._id }));

  // A. Mutation Tạo mới
  const mutationCreate = useMutationHooks((data) =>
    UserService.createUserByAdmin(data, user?.access_token)
  );
  const {
    isPending: isPendingCreate,
    isSuccess: isSuccessCreate,
    isError: isErrorCreate,
    data: dataCreate,
    error: errorCreate,
  } = mutationCreate;

  // B. Mutation Cập nhật
  const mutationUpdate = useMutationHooks((data) => {
    const { id, ...rests } = data;
    return UserService.updateUser(id, rests, user?.access_token);
  });
  const {
    isPending: isPendingUpdate,
    isSuccess: isSuccessUpdate,
    isError: isErrorUpdate,
    data: dataUpdate,
    error: errorUpdate,
  } = mutationUpdate;

  // C. Mutation Xóa
  const mutationDelete = useMutationHooks((id) =>
    UserService.deleteUser(id, user?.access_token)
  );
  const {
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    data: dataDelete,
    error: errorDelete,
  } = mutationDelete;

  // Gọi lại hàm getAllUser để lấy dữ liệu mới nhất (hoặc tạo API export riêng nếu backend hỗ trợ)
  const mutationExport = useMutationHooks(() =>
    UserService.getAllUser(user?.access_token)
  );
  const {
    isPending: isPendingExport,
    isSuccess: isSuccessExport,
    isError: isErrorExport,
    data: dataExport,
    error: errorExport,
  } = mutationExport;

  // Xử lý Tạo mới
  useEffect(() => {
    if (isSuccessCreate && dataCreate) {
      if (dataCreate.status === "OK") {
        messageApi.success("Tạo tài khoản thành công!");
        setIsModalOpenCreate(false);
        formCreate.resetFields();
        queryClient.invalidateQueries(["admin-users"]);
      } else {
        messageApi.error(dataCreate.message || "Tạo thất bại!");
      }
    } else if (isErrorCreate) {
      messageApi.error(
        errorCreate?.response?.data?.message ||
          errorCreate?.message ||
          "Lỗi tạo tài khoản!"
      );
    }
  }, [
    isSuccessCreate,
    isErrorCreate,
    dataCreate,
    errorCreate,
    messageApi,
    formCreate,
    queryClient,
  ]);

  // Xử lý Cập nhật
  useEffect(() => {
    if (isSuccessUpdate && dataUpdate) {
      if (dataUpdate.status === "OK") {
        messageApi.success("Cập nhật thành công!");
        queryClient.invalidateQueries(["admin-users"]);
        setIsOpenEditDrawer(false);
      } else {
        messageApi.error(dataUpdate.message || "Cập nhật thất bại!");
      }
    } else if (isErrorUpdate) {
      messageApi.error(
        errorUpdate?.response?.data?.message ||
          errorUpdate?.message ||
          "Lỗi kết nối!"
      );
    }
  }, [
    isSuccessUpdate,
    isErrorUpdate,
    dataUpdate,
    errorUpdate,
    messageApi,
    queryClient,
  ]);

  // Xử lý Xóa
  useEffect(() => {
    if (isSuccessDelete && dataDelete) {
      if (dataDelete.status === "OK") {
        messageApi.success("Xóa thành công!");
        queryClient.invalidateQueries(["admin-users"]);
        setIsModalOpenDelete(false);
      } else {
        messageApi.error(dataDelete.message || "Xóa thất bại!");
      }
    } else if (isErrorDelete) {
      messageApi.error(
        errorDelete?.response?.data?.message ||
          errorDelete?.message ||
          "Lỗi kết nối!"
      );
    }
  }, [
    isSuccessDelete,
    isErrorDelete,
    dataDelete,
    errorDelete,
    messageApi,
    queryClient,
  ]);

  // Xử lý Export Excel
  useEffect(() => {
    if (isSuccessExport && dataExport) {
      messageApi.destroy("export_loading");
      try {
        const usersToExport = dataExport.data || [];
        if (usersToExport.length === 0) {
          messageApi.warning("Không có dữ liệu để xuất");
          return;
        }

        const excel = usersToExport.map((u) => ({
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
          // Lấy tên role từ object role hoặc tìm trong rolesData nếu role chỉ là ID string
          "Vai trò": u.isAdmin
            ? u.role?.name ||
              rolesData?.data?.find((r) => r._id === u.role)?.name ||
              "Admin"
            : "Khách hàng",
          "Trạng thái": u.isBlocked ? "Đã khóa" : "Hoạt động",
          "Ngày tạo": new Date(u.createdAt).toLocaleDateString("vi-VN"),
        }));

        const ws = XLSX.utils.json_to_sheet(excel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachUser");
        XLSX.writeFile(wb, "DanhSachNguoiDung.xlsx");

        messageApi.success("Xuất file thành công!");
        mutationExport.reset(); // Reset trạng thái
      } catch (error) {
        console.error("Export error:", error);
        messageApi.error("Có lỗi khi tạo file Excel");
      }
    } else if (isErrorExport) {
      messageApi.destroy("export_loading");
      messageApi.error(
        errorExport?.response?.data?.message || "Lỗi lấy dữ liệu xuất file!"
      );
    }
  }, [
    isSuccessExport,
    isErrorExport,
    dataExport,
    errorExport,
    messageApi,
    mutationExport,
    rolesData,
  ]);

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
      // Map role object sang ID hoặc giữ nguyên string ID
      role: record.role?._id || record.role || undefined,
      gender: record.gender,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
    });
    setIsOpenEditDrawer(true);
  };

  const onFinishCreate = (values) => {
    const createData = { ...values };

    // Nếu người tạo không có quyền quản lý role, hoặc chọn không phải Admin
    // Thì xóa trường role đi để đảm bảo an toàn
    if (!canManageRoles) {
      delete createData.isAdmin;
      delete createData.role;
    } else if (!createData.isAdmin) {
      delete createData.role;
    }

    mutationCreate.mutate(createData);
  };

  const onFinishUpdate = (values) => {
    const updateData = { ...values };

    // Nếu không có quyền quản lý user -> Xóa field role & isAdmin để không ghi đè
    if (!canManageRoles) {
      delete updateData.isAdmin;
      delete updateData.role;
    } else {
      // Nếu có quyền, nhưng lại cố tình hack để gửi role "Super Admin" (mà mình không phải Super Admin)
      // Thì logic availableRolesOptions ở trên đã chặn hiển thị rồi.
      // Backend cũng sẽ chặn nếu bạn cấu hình middleware checkPermission('system') cho việc gán role cao cấp.

      if (!updateData.isAdmin) {
        updateData.role = null;
      }
    }
    mutationUpdate.mutate({ id: stateUserDetails._id, ...updateData });
  };

  const handleDeleteUser = () => {
    mutationDelete.mutate(rowSelected);
  };

  const handleExportExcel = () => {
    messageApi.loading({
      content: "Đang lấy dữ liệu...",
      key: "export_loading",
      duration: 0,
    });
    mutationExport.mutate();
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
      title: "Vai trò",
      dataIndex: "role",
      render: (role, record) => {
        if (!record.isAdmin) return <Tag color="green">Customer</Tag>;
        // Hiển thị tên Role (nếu có) hoặc 'Admin'
        const roleName =
          role?.name ||
          rolesData?.data?.find((r) => r._id === role)?.name ||
          "Admin";
        return <Tag color="geekblue">{roleName}</Tag>;
      },
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
          {canManageRoles && (
            <ButtonComponent
              type="primary"
              icon={<UserAddOutlined />}
              textButton="Thêm Người dùng"
              onClick={() => setIsModalOpenCreate(true)}
            />
          )}

          <ButtonComponent
            type="primary"
            style={{ backgroundColor: "#10893E", borderColor: "#10893E" }}
            icon={<DownloadOutlined />}
            textButton="Xuất Excel"
            onClick={handleExportExcel}
            loading={isPendingExport}
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
        <UserHistoryDrawer
          isOpen={isOpenHistoryDrawer}
          onClose={() => {
            setIsOpenHistoryDrawer(false);
            setUserSelectedHistory(null);
          }}
          userId={userSelectedHistory}
        />

        {/* DRAWER EDIT */}
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

            {/* PHÂN QUYỀN: CHỈ HIỆN NẾU CÓ QUYỀN QUẢN LÝ ROLE */}
            {canManageRoles ? (
              <div
                style={{
                  marginTop: 20,
                  padding: "15px",
                  background: "#f0f5ff",
                  border: "1px solid #adc6ff",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#1d39c4" }}>
                    Cấp quyền Quản trị viên?
                  </span>
                  <Form.Item name="isAdmin" valuePropName="checked" noStyle>
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </div>
                {isAdminWatchingEdit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <Form.Item
                      label="Vai trò cụ thể"
                      name="role"
                      rules={[
                        { required: true, message: "Vui lòng chọn vai trò" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn vai trò"
                        options={availableRolesOptions}
                      />
                    </Form.Item>
                  </motion.div>
                )}
              </div>
            ) : (
              <div
                style={{
                  marginTop: 20,
                  padding: "10px",
                  background: "#fff1f0",
                  border: "1px solid #ffccc7",
                  borderRadius: 4,
                  color: "#cf1322",
                  fontSize: 13,
                }}
              >
                <LockOutlined /> Bạn không có quyền thay đổi vai trò.
              </div>
            )}

            <Form.Item style={{ marginTop: 30 }}>
              <ButtonComponent
                type="primary"
                htmlType="submit"
                textButton="Cập nhật"
                block
                loading={isPendingUpdate}
              />
            </Form.Item>
          </Form>
        </Drawer>

        {/* MODAL CREATE */}
        <Modal
          title="Thêm Người dùng mới"
          open={isModalOpenCreate}
          onOk={formCreate.submit}
          onCancel={() => setIsModalOpenCreate(false)}
          width={600}
          confirmLoading={isPendingCreate}
        >
          <Form form={formCreate} layout="vertical" onFinish={onFinishCreate}>
            <Form.Item
              label="Họ và tên"
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input placeholder="example@mail.com" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: "Mật khẩu ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="098..." />
            </Form.Item>

            {/* PHẦN PHÂN QUYỀN CREATE */}
            {canManageRoles && (
              <div
                style={{
                  marginTop: 10,
                  padding: "15px",
                  background: "#f0f5ff",
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
                  <span style={{ fontWeight: 600 }}>
                    Tạo tài khoản Quản trị (Admin)?
                  </span>
                  <Form.Item name="isAdmin" valuePropName="checked" noStyle>
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                </div>
                {isAdminWatchingCreate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ marginTop: 12 }}
                  >
                    <Form.Item
                      label="Vai trò cụ thể"
                      name="role"
                      rules={[
                        { required: true, message: "Vui lòng chọn vai trò" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn vai trò"
                        options={availableRolesOptions}
                      />
                    </Form.Item>
                  </motion.div>
                )}
              </div>
            )}
          </Form>
        </Modal>

        {/* MODAL XÓA USER */}
        <Modal
          title="Xác nhận xóa người dùng"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={handleDeleteUser}
          okText="Xóa"
          okButtonProps={{ danger: true, loading: isPendingDelete }}
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
