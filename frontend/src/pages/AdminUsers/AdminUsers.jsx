"use client";

import { useState, useMemo } from "react";
import { Table, Space, Card, Tag, Input, Button, Modal, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as UserService from "../../services/UserService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Search } = Input;

const AdminUsers = () => {
  const user = useSelector((state) => state.user);
  const { messageApi } = useMessageApi();
  
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // State cho bộ lọc Role
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH DATA ---
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UserService.getAllUser(user?.access_token),
    enabled: !!user?.access_token,
  });

  // --- SEARCH & FILTER ---
  const filteredData = useMemo(() => {
      let data = usersData?.data || [];

      // 1. Lọc theo Search Text
      if (searchText) {
          const lowerSearch = searchText.toLowerCase();
          data = data.filter((item) => 
            (item.name || item.username || '').toLowerCase().includes(lowerSearch) ||
            (item.email || '').toLowerCase().includes(lowerSearch) ||
            (item.phone || '').includes(lowerSearch)
          );
      }

      // 2. Lọc theo Role (Admin/Customer)
      if (roleFilter !== 'all') {
          const isAdminFilter = roleFilter === 'admin'; // true nếu chọn Admin, false nếu chọn Customer
          data = data.filter((item) => item.isAdmin === isAdminFilter);
      }

      return data;
  }, [usersData, searchText, roleFilter]);

  // --- COLUMNS ---
  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username", 
      key: "username",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
        title: "SĐT",
        dataIndex: "phone",
        key: "phone",
        render: (phone) => phone || "Chưa cập nhật"
    },
    {
      title: "Vai trò",
      dataIndex: "isAdmin",
      key: "role",
      render: (isAdmin) => (
          <Tag color={isAdmin ? "volcano" : "green"}>
              {isAdmin ? "ADMIN" : "KHACH HANG"}
          </Tag>
      ),
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
          />
          <ButtonComponent 
            danger 
            type="primary" 
            size="small" 
            icon={<DeleteOutlined />} 
            disabled={record.isAdmin} // Không cho xóa Admin
          />
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Quản lý Người dùng</h1>
        </div>

        {/* KHU VỰC BỘ LỌC */}
        <div style={{ marginBottom: 24, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
             <Search
                placeholder="Tìm kiếm theo tên, email, sđt..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
             />
             
             <Select
                defaultValue="all"
                style={{ width: 180, height: 40 }} // Chỉnh height để khớp với Search size="large"
                size="large"
                onChange={(value) => setRoleFilter(value)}
                options={[
                    { value: 'all', label: 'Tất cả vai trò' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'customer', label: 'Khách hàng' },
                ]}
             />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id" 
          pagination={{
            pageSize: 10,
            position: ["bottomCenter"],
          }}
          className="admin-table"
          loading={isLoading}
          scroll={{ x: true }}
        />
      </Card>
    </motion.div>
  );
};

export default AdminUsers;