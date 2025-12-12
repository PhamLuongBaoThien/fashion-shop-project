import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHooks } from "../../hooks/useMutationHook";
import { useSelector } from "react-redux";
import * as RoleService from "../../services/RoleService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

// DANH SÁCH QUYỀN (DOMAIN)
const DOMAIN_PERMISSIONS = [
  { label: "Sản phẩm", value: "product" },
  { label: "Danh mục", value: "category" },
  { label: "Đơn hàng & Doanh thu", value: "order" },
  { label: "Người dùng", value: "user" },
  { label: "Quyền & Phân quyền", value: "system" },
];

const AdminRoles = () => {
  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // State cho Modal Xóa (Mới thêm)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleIdToDelete, setRoleIdToDelete] = useState(null);

  const [form] = Form.useForm();

  const user = useSelector((state) => state.user);

  // Lấy messageApi an toàn
  const messageApiData = useMessageApi();
  const { messageApi } = messageApiData;

  const queryClient = useQueryClient();

  // --- 1. FETCH DATA ---
  const {
    data: rolesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => RoleService.getAllRoles(user?.access_token), // Truyền token nếu service cần
    enabled: !!user?.access_token,
  });

  // --- 2. MUTATIONS ---
  // --- 2. MUTATIONS (Sử dụng useMutationHooks) ---

  // A. Mutation Tạo mới
  const mutationCreate = useMutationHooks((data) =>
    RoleService.createRole(data, user?.access_token)
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
    const { id, body } = data;
    return RoleService.updateRole(id, body, user?.access_token);
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
    RoleService.deleteRole(id, user?.access_token)
  );
  const {
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    data: dataDelete,
    error: errorDelete,
  } = mutationDelete;

  // --- 3. USE EFFECTS (Xử lý Side Effects) ---
  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
  }, [form]);

  // Xử lý Tạo mới
  useEffect(() => {
    if (isSuccessCreate && dataCreate) {
      if (dataCreate.status === "OK") {
        messageApi.success("Tạo vai trò thành công!");
        handleCancel();
        queryClient.invalidateQueries(["admin-roles"]);
      } else {
        messageApi.error(dataCreate.message || "Tạo thất bại!");
      }
    } else if (isErrorCreate) {
      const errorMsg =
        errorCreate?.response?.data?.message ||
        errorCreate?.message ||
        "Lỗi kết nối!";
      messageApi.error(errorMsg);
    }
  }, [
    isSuccessCreate,
    isErrorCreate,
    dataCreate,
    errorCreate,
    messageApi,
    queryClient,
    handleCancel,
  ]);

  // Xử lý Cập nhật
  useEffect(() => {
    if (isSuccessUpdate && dataUpdate) {
      if (dataUpdate.status === "OK") {
        messageApi.success("Cập nhật thành công!");
        handleCancel();
        queryClient.invalidateQueries(["admin-roles"]);
      } else {
        messageApi.error(dataUpdate.message || "Cập nhật thất bại!");
      }
    } else if (isErrorUpdate) {
      const errorMsg =
        errorUpdate?.response?.data?.message ||
        errorUpdate?.message ||
        "Lỗi kết nối!";
      messageApi.error(errorMsg);
    }
  }, [
    isSuccessUpdate,
    isErrorUpdate,
    dataUpdate,
    errorUpdate,
    messageApi,
    queryClient,
    handleCancel,
  ]);

  // Xử lý Xóa
  useEffect(() => {
    if (isSuccessDelete && dataDelete) {
      if (dataDelete.status === "OK") {
        messageApi.success("Xóa thành công!");
        queryClient.invalidateQueries(["admin-roles"]);
        setIsDeleteModalOpen(false);
        setRoleIdToDelete(null);
      } else {
        messageApi.error(dataDelete.message || "Xóa thất bại!");
      }
    } else if (isErrorDelete) {
      const errorMsg =
        errorDelete?.response?.data?.message ||
        errorDelete?.message ||
        "Lỗi kết nối!";
      messageApi.error(errorMsg);
    }
  }, [
    isSuccessDelete,
    isErrorDelete,
    dataDelete,
    errorDelete,
    messageApi,
    queryClient,
  ]);

  // --- HANDLERS ---

  const handleAddRole = () => {
    setIsEditMode(false);
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditRole = (record) => {
    setIsEditMode(true);
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      permissions: record.permissions || [],
    });
    setIsModalOpen(true);
  };

  // Thay vì gọi Modal.confirm, ta chỉ mở Modal State
  const handleDeleteRole = (id) => {
    setRoleIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Hàm này được gọi khi bấm nút "Xóa" trong Modal
  const onConfirmDelete = () => {
    if (roleIdToDelete) {
      mutationDelete.mutate(roleIdToDelete);
    }
  };

  const onFinish = (values) => {
    if (isEditMode && editingRole) {
      mutationUpdate.mutate({ id: editingRole._id, body: values });
    } else {
      mutationCreate.mutate(values);
    }
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: "Vai trò",
      dataIndex: "name",
      key: "name",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "desc",
    },
    {
      title: "Quyền quản lý",
      dataIndex: "permissions",
      key: "perm",
      render: (perms) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {perms?.map((p) => {
            const label =
              DOMAIN_PERMISSIONS.find((d) => d.value === p)?.label || p;
            return (
              <Tag key={p} color="blue">
                {label}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.name !== "Super Admin" && (
            <Tooltip title="Sửa">
              <ButtonComponent
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditRole(record)}
              />
            </Tooltip>
          )}

          {record.name !== "Super Admin" && (
            <Tooltip title="Xóa">
              <ButtonComponent
                danger
                type="primary"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteRole(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (isError) {
    // Lấy message lỗi khi fetch thất bại
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra khi tải dữ liệu.";
    return (
      <div style={{ padding: 20, color: "red" }}>
        Lỗi tải dữ liệu: {errorMsg}
      </div>
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
            marginBottom: 24,
          }}
        >
          <h1>Quản lý Phân Quyền</h1>
          <ButtonComponent
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
            textButton="Thêm Vai trò"
            style={{ backgroundColor: "#10893E", borderColor: "#10893E" }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={rolesData?.data || []}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="admin-table"
          loading={isLoading}
        />
      </Card>

      {/* MODAL THÊM / SỬA */}
      <Modal
        title={isEditMode ? "Chỉnh sửa Vai trò" : "Thêm Vai trò mới"}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={handleCancel}
        width={700}
        confirmLoading={isPendingCreate || isPendingUpdate}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên vai trò"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
            z
          >
            <Input placeholder="Ví dụ: Nhân viên kho" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả trách nhiệm..." />
          </Form.Item>

          <Form.Item label="Phạm vi quản lý" name="permissions">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                {DOMAIN_PERMISSIONS.map((p) => (
                  <Col span={12} key={p.value}>
                    <Checkbox value={p.value}>{p.label}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL XÓA VAI TRÒ (Đã tách riêng) */}
      <Modal
        title="Xác nhận xóa vai trò"
        open={isDeleteModalOpen}
        onOk={onConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: isPendingDelete }}
      >
        <p>Bạn có chắc chắn muốn xóa vai trò này không?</p>
        <p style={{ color: "red", fontSize: "13px" }}>
          Lưu ý: Các tài khoản đang giữ vai trò này sẽ mất quyền hạn tương ứng!
        </p>
      </Modal>
    </motion.div>
  );
};

export default AdminRoles;
