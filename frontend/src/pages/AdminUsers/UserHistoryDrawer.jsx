import React from "react";
import { Drawer, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as OrderService from "../../services/OrderService"; // Đảm bảo đường dẫn đúng
import { useMessageApi } from "../../context/MessageContext";

const UserHistoryDrawer = ({ isOpen, onClose, userId }) => {
  const user = useSelector((state) => state.user);
  const { messageApi } = useMessageApi();

  // Gọi API lấy danh sách đơn hàng của user được chọn
  const {
    data: userOrders,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["admin-user-orders", userId],
    queryFn: () => OrderService.getOrdersByUserId(userId, user?.access_token),
    enabled: !!userId && !!user?.access_token && isOpen, // Chỉ gọi khi Drawer mở và có ID
  });

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <b style={{ fontFamily: "monospace" }}>#{id.slice(-6).toUpperCase()}</b>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => (
        <span style={{ fontWeight: 500, color: "#fa8c16" }}>
          {price?.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (paid) =>
        paid ? (
          <Tag color="success">Đã TT</Tag>
        ) : (
          <Tag color="warning">Chưa TT</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "pending") color = "orange";
        if (status === "confirmed") color = "blue";
        if (status === "shipped") color = "geekblue";
        if (status === "delivered") color = "green";
        if (status === "cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  if (isError) {
    messageApi.error(error.response?.data?.message);
  }

  return (
    <Drawer
      title="Lịch sử mua hàng"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={720} // Mở rộng chút để dễ nhìn
      destroyOnClose // Reset drawer khi đóng
    >
      <Table
        columns={columns}
        dataSource={userOrders?.data || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: true }}
      />
    </Drawer>
  );
};

export default UserHistoryDrawer;
