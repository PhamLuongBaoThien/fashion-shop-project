import { useMemo, useState } from "react";
import {
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import RichTextEditor from "../../components/common/RichTextEditor/RichTextEditor";
import { useMessageApi } from "../../context/MessageContext";
import * as PolicyService from "../../services/PolicyService";
import "./AdminPolicies.css";

const POLICY_TYPES = [
  { value: "shipping", label: "Chính sách giao hàng" },
  { value: "return", label: "Đổi trả & hoàn tiền" },
  { value: "payment", label: "Chính sách thanh toán" },
  { value: "privacy", label: "Chính sách bảo mật" },
  { value: "terms", label: "Điều khoản sử dụng" },
];

const AdminPolicies = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessageApi();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-policies"],
    queryFn: PolicyService.getAdminPolicies,
  });

  const policies = useMemo(() => data?.data || [], [data]);
  const typeLabels = useMemo(
    () => Object.fromEntries(POLICY_TYPES.map((item) => [item.value, item.label])),
    []
  );

  // Mở cùng một biểu mẫu cho cả tạo mới và chỉnh sửa để tránh lặp giao diện.
  const openForm = (policy = null) => {
    setEditingPolicy(policy);
    form.setFieldsValue(
      policy
        ? {
            title: policy.title,
            type: policy.type,
            content: policy.content,
            isPublished: policy.isPublished,
          }
        : { title: "", type: undefined, content: "", isPublished: false }
    );
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
    form.resetFields();
  };

  // Lưu bản nháp hoặc publish tùy theo công tắc trong biểu mẫu.
  const handleSave = async (values) => {
    setIsSaving(true);
    try {
      if (editingPolicy) {
        await PolicyService.updatePolicy(editingPolicy._id, values);
        showSuccess("Cập nhật chính sách thành công");
      } else {
        await PolicyService.createPolicy(values);
        showSuccess("Tạo chính sách thành công");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-policies"] });
      closeForm();
    } catch (error) {
      showError(error?.response?.data?.message || "Không thể lưu chính sách");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await PolicyService.deletePolicy(id);
      showSuccess("Xóa chính sách thành công");
      await queryClient.invalidateQueries({ queryKey: ["admin-policies"] });
    } catch (error) {
      showError(error?.response?.data?.message || "Không thể xóa chính sách");
    } finally {
      setDeletingId(null);
    }
  };

  const typeOptions = POLICY_TYPES.map((option) => ({
    ...option,
    disabled:
      !editingPolicy && policies.some((policy) => policy.type === option.value),
  }));

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => typeLabels[type] || type,
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished) => (
        <Tag color={isPublished ? "green" : "default"}>
          {isPublished ? "Đã xuất bản" : "Bản nháp"}
        </Tag>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <ButtonComponent
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openForm(record)}
          />
          <Popconfirm
            title="Xóa chính sách?"
            description="Liên kết công khai của chính sách này sẽ không còn nội dung."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <ButtonComponent
              danger
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              loading={deletingId === record._id}
            />
          </Popconfirm>
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
        <div className="admin-page-header">
          <h1>Quản lý Chính sách</h1>
          <ButtonComponent
            type="primary"
            icon={<PlusOutlined />}
            textButton="Thêm chính sách"
            disabled={policies.length >= POLICY_TYPES.length}
            onClick={() => openForm()}
          />
        </div>

        <Table
          rowKey="_id"
          className="admin-table"
          loading={isLoading}
          columns={columns}
          dataSource={policies}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Card>

      <Modal
        title={editingPolicy ? "Chỉnh sửa chính sách" : "Thêm chính sách"}
        open={isModalOpen}
        onCancel={closeForm}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={isSaving}
        width={900}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập tiêu đề" },
              { max: 150, message: "Tiêu đề tối đa 150 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Chính sách giao hàng" />
          </Form.Item>

          <Form.Item
            label="Loại chính sách"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại chính sách" }]}
          >
            <Select
              options={typeOptions}
              disabled={Boolean(editingPolicy)}
              placeholder="Chọn loại chính sách"
            />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung" },
              {
                validator: (_, value) =>
                  value?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
                    ? Promise.resolve()
                    : Promise.reject(new Error("Vui lòng nhập nội dung")),
              },
            ]}
          >
            <RichTextEditor />
          </Form.Item>

          <Form.Item label="Xuất bản" name="isPublished" valuePropName="checked">
            <Switch checkedChildren="Công khai" unCheckedChildren="Bản nháp" />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AdminPolicies;
