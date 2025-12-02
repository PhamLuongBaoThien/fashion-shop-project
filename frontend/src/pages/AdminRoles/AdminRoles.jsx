"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Checkbox, Space, Card, Row, Col, Tag, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const messageApi = messageApiData?.messageApi || { success: console.log, error: console.error };

  const queryClient = useQueryClient();

  // --- 1. FETCH DATA ---
  const { data: rolesData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => RoleService.getAllRoles(user?.access_token), // Truyền token nếu service cần
    enabled: !!user?.access_token,
  });

  // --- 2. MUTATIONS ---

  // Tạo mới
  const mutationCreate = useMutation({
    mutationFn: (data) => RoleService.createRole(data, user?.access_token),
    onSuccess: (data) => {
        if (data?.status === 'OK') {
            messageApi.success("Tạo vai trò thành công!");
            handleCancel(); 
            queryClient.invalidateQueries(["admin-roles"]);
        } else {
            messageApi.error(data?.message || "Tạo thất bại!");
        }
    },
    onError: (err) => {
        // Lấy message từ backend trả về (nếu có)
        const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối!";
        messageApi.error(errorMsg);
    }
  });

  // Cập nhật
  const mutationUpdate = useMutation({
    mutationFn: (data) => {
        const { id, body } = data; 
        return RoleService.updateRole(id, body, user?.access_token);
    },
    onSuccess: (data) => {
        if (data?.status === 'OK') {
            messageApi.success("Cập nhật thành công!");
            handleCancel();
            queryClient.invalidateQueries(["admin-roles"]);
        } else {
            messageApi.error(data?.message || "Cập nhật thất bại!");
        }
    },
    onError: (err) => {
        const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối!";
        messageApi.error(errorMsg);
    }
  });

  // Xóa
  const mutationDelete = useMutation({
    mutationFn: (id) => RoleService.deleteRole(id, user?.access_token),
    onSuccess: (data) => {
        if (data?.status === 'OK') {
            messageApi.success("Xóa thành công!");
            queryClient.invalidateQueries(["admin-roles"]);
            // Đóng modal xóa
            setIsDeleteModalOpen(false);
            setRoleIdToDelete(null);
        } else {
            messageApi.error(data?.message || "Xóa thất bại!");
        }
    },
    onError: (err) => {
        const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối!";
        messageApi.error(errorMsg);
    }
  });

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
          permissions: record.permissions || []
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

  const handleCancel = () => {
      setIsModalOpen(false);
      form.resetFields();
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
        render: (t) => <b>{t}</b> 
    },
    { 
        title: "Mô tả", 
        dataIndex: "description", 
        key: "desc" 
    },
    { 
        title: "Quyền quản lý", 
        dataIndex: "permissions", 
        key: "perm",
        render: (perms) => (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {perms?.map(p => {
                    const label = DOMAIN_PERMISSIONS.find(d => d.value === p)?.label || p;
                    return <Tag key={p} color="blue">{label}</Tag>
                })}
            </div>
        )
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
              <ButtonComponent 
                type="primary" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => handleEditRole(record)} 
              />
          </Tooltip>
          
          {record.name !== 'Super Admin' && (
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
      const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tải dữ liệu.";
      return <div style={{padding: 20, color: 'red'}}>Lỗi tải dữ liệu: {errorMsg}</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
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
        confirmLoading={mutationCreate.isPending || mutationUpdate.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label="Tên vai trò" 
            name="name" 
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input placeholder="Ví dụ: Nhân viên kho" />
          </Form.Item>
          
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả trách nhiệm..." />
          </Form.Item>

          <Form.Item label="Phạm vi quản lý" name="permissions">
            <Checkbox.Group style={{ width: '100%' }}>
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
        okButtonProps={{ danger: true, loading: mutationDelete.isPending }}
      >
        <p>Bạn có chắc chắn muốn xóa vai trò này không?</p>
        <p style={{ color: 'red', fontSize: '13px' }}>
            Lưu ý: Các tài khoản đang giữ vai trò này sẽ mất quyền hạn tương ứng!
        </p>
      </Modal>
    </motion.div>
  );
};

export default AdminRoles;