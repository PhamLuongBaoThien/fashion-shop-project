import { useEffect, useState } from "react";
import { Table, Modal, Form, Input, Card, Space, Spin, Alert } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHooks } from "../../hooks/useMutationHook"; // Import hook

import * as CategoryService from "../../services/CategoryService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { showSuccess, showError } = useMessageApi();

  // 2. DÙNG useQuery ĐỂ LẤY DANH SÁCH DANH MỤC
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"], // Đặt key định danh cho query
    queryFn: CategoryService.getAllCategories,
    retry: 3,
    retryDelay: 1000,
  });

  // 2. MUTATION: TẠO MỚI
  const mutationCreate = useMutationHooks((data) => CategoryService.createCategory(data));
  const { 
      isPending: isPendingCreate, 
      isSuccess: isSuccessCreate, 
      isError: isErrorCreate, 
      data: dataCreate,
      error: errorCreate
  } = mutationCreate;

  // 3. MUTATION: CẬP NHẬT
  const mutationUpdate = useMutationHooks((data) => CategoryService.updateCategory(data.id, data.data));
  const { 
      isPending: isPendingUpdate, 
      isSuccess: isSuccessUpdate, 
      isError: isErrorUpdate, 
      data: dataUpdate,
      error: errorUpdate
  } = mutationUpdate;

// 4. USE EFFECT XỬ LÝ KẾT QUẢ TẠO MỚI
  useEffect(() => {
    if (isSuccessCreate && dataCreate) {
        if(dataCreate.status === 'OK') {
            showSuccess(dataCreate.message || "Thêm danh mục thành công!");
            setIsModalOpen(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        } else {
            showError(dataCreate.message || "Lỗi tạo danh mục");
        }
    } else if (isErrorCreate) {
        showError(errorCreate?.response?.data?.message || "Đã xảy ra lỗi khi tạo!");
    }
  }, [isSuccessCreate, isErrorCreate, dataCreate, errorCreate, showSuccess, showError, form, queryClient]);

  // 5. USE EFFECT XỬ LÝ KẾT QUẢ CẬP NHẬT
  useEffect(() => {
    if (isSuccessUpdate && dataUpdate) {
        if(dataUpdate.status === 'OK') {
            showSuccess(dataUpdate.message || "Cập nhật danh mục thành công!");
            setIsEditModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        } else {
            showError(dataUpdate.message || "Lỗi cập nhật");
        }
    } else if (isErrorUpdate) {
        showError(errorUpdate?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật!");
    }
  }, [isSuccessUpdate, isErrorUpdate, dataUpdate, errorUpdate, showSuccess, showError, form, queryClient]);



  // 4. KẾT NỐI MODAL VỚI FORM VÀ MUTATION
  const handleOk = () => {
    form.submit(); // Kích hoạt onFinish của Form
  };
  const onFinish = (values) => {
    mutationCreate.mutate(values); // Gửi dữ liệu từ form đi
  };

  const handleEdit = (record) => {
    setEditingCategory(record); // Lưu lại category đang sửa
    form.setFieldsValue({
      // Điền dữ liệu vào form
      name: record.name,
      description: record.description,
    });
    setIsEditModalOpen(true); // Mở modal sửa
  };

  const handleUpdateOk = () => {
    form.submit(); // Kích hoạt onUpdateFinish
  };

  const onUpdateFinish = (values) => {
    // Gọi mutation với id và dữ liệu mới
    mutationUpdate.mutate({ id: editingCategory._id, data: values });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    form.resetFields();
    setEditingCategory(null);
  };

  const columns = [
    { title: "Tên Danh mục", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    // { title: "Số sản phẩm", dataIndex: "productCount", key: "productCount" }, // Cần tính ở backend
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <ButtonComponent
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {/* <ButtonComponent
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
          /> */}
        </Space>
      ),
    },
  ];

  // 5. XỬ LÝ TRẠNG THÁI LOADING VÀ LỖI
  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", height: "80vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description={error.response.data.message || error.message}
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
        <div className="admin-page-header">
          <h1>Quản lý Danh mục</h1>
          <ButtonComponent
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            textButton={"Thêm Danh mục"}
          />
        </div>

        <Table
          columns={columns}
          dataSource={categoriesData?.data} // Lấy mảng data từ response
          rowKey="_id" // Dùng _id từ MongoDB
          loading={isLoading}
          pagination={{
            pageSize: 10,
            position: ["bottomCenter"],
          }}
          className="admin-table"
        />
      </Card>

      <Modal
        title="Thêm Danh mục mới"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isPendingCreate} // Nút OK sẽ loading khi đang gọi API
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Ví dụ: Áo Sơ Mi" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả ngắn cho danh mục"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chỉnh sửa Danh mục: ${editingCategory?.name}`}
        open={isEditModalOpen}
        onOk={handleUpdateOk}
        onCancel={handleCancelEdit}
        confirmLoading={isPendingUpdate}
        //forceRender // Xóa state của form khi đóng
      >
        <Form form={form} layout="vertical" onFinish={onUpdateFinish}>
          <Form.Item
            label="Tên Danh mục"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ví dụ: Áo Sơ Mi" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AdminCategories;
