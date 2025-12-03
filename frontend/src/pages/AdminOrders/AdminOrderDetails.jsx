import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  Tag,
  Space,
  Button,
  Select, // Import Select
  Spin,
  Breadcrumb,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  CarOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHooks } from "../../hooks/useMutationHook";
import * as OrderService from "../../services/OrderService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Title, Text } = Typography;

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { messageApi } = useMessageApi();
  const queryClient = useQueryClient();

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["admin-order-details", id],
    queryFn: () => OrderService.getOrderDetails(id),
    enabled: !!id,
  });

  const order = orderDetails?.data;

  const mutation = useMutationHooks((data) =>
    OrderService.updateOrder(id, user?.access_token, data)
  );
  const { isPending, isSuccess, isError, data: dataMutation, error } = mutation;

  // 3. Xử lý side effects (Thông báo & Refresh data) bằng useEffect
  useEffect(() => {
    if (isSuccess && dataMutation) {
      if (dataMutation.status === "OK") {
        messageApi.success("Cập nhật trạng thái thành công!");
        // Làm mới dữ liệu chi tiết đơn hàng này
        queryClient.invalidateQueries(["admin-order-details", id]);
        // Làm mới danh sách đơn hàng bên ngoài để cập nhật trạng thái
        queryClient.invalidateQueries(["admin-orders"]);
      } else {
        messageApi.error(dataMutation.message || "Cập nhật thất bại");
      }
    } else if (isError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      messageApi.error(errorMessage);
    }
  }, [isSuccess, isError, dataMutation, error, id, queryClient, messageApi]);

  // Hàm xử lý thay đổi trạng thái từ Dropdown
  const handleChangeStatus = (value) => {
    mutation.mutate({ status: value });
  };

  const handleUpdatePaid = () => {
    mutation.mutate({ isPaid: true });
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      render: (text, record) => (
        <Space>
          <img
            src={record.image}
            alt={text}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Size: {record.size}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price) => price?.toLocaleString() + "đ",
    },
    {
      title: "SL",
      dataIndex: "quantity",
    },
    {
      title: "Thành tiền",
      render: (_, record) =>
        (record.price * record.quantity).toLocaleString() + "đ",
    },
  ];

  if (isLoading || !order) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Map màu sắc cho status
  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    shipped: "cyan",
    delivered: "green",
    cancelled: "red",
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <Link to="/system/admin/orders">Đơn hàng</Link> },
            { title: `Chi tiết #${order._id.slice(-6).toUpperCase()}` },
          ]}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Chi tiết đơn hàng
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/system/admin/orders")}
        >
          Quay lại
        </Button>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card
            title="Danh sách sản phẩm"
            bordered={false}
            style={{ marginBottom: 24 }}
          >
            <Table
              columns={columns}
              dataSource={order.orderItems}
              pagination={false}
              rowKey="product"
            />
            <Divider />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 250 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>Tạm tính:</Text>
                  <Text>{order.itemsPrice?.toLocaleString()}đ</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>Phí vận chuyển:</Text>
                  <Text>{order.shippingPrice?.toLocaleString()}đ</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  <Text>Tổng cộng:</Text>
                  <Text type="danger">
                    {order.totalPrice?.toLocaleString()}đ
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Thông tin vận chuyển" bordered={false}>
            <Row gutter={24}>
              <Col span={12}>
                <Title level={5}>Người nhận</Title>
                <p>
                  <strong>Tên:</strong> {order.shippingInfo?.fullName}
                </p>
                <p>
                  <strong>SĐT:</strong> {order.shippingInfo?.phone}
                </p>
              </Col>
              <Col span={12}>
                <Title level={5}>Địa chỉ giao hàng</Title>
                <p>{order.shippingInfo?.detailAddress}</p>
                <p>
                  {order.shippingInfo?.ward}, {order.shippingInfo?.district}
                </p>
                <p>{order.shippingInfo?.province}</p>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="Cập nhật trạng thái"
            bordered={false}
            style={{ marginBottom: 24 }}
          >
            {/* 1. TRẠNG THÁI ĐƠN HÀNG (MỚI) */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <CarOutlined /> Trạng thái giao vận
              </div>

              {/* Hiển thị Tag hiện tại */}
              <div style={{ marginBottom: 12 }}>
                <Tag
                  color={statusColors[order.status || "pending"]}
                  style={{ fontSize: 14, padding: "4px 10px" }}
                >
                  {statusLabels[order.status || "pending"]?.toUpperCase()}
                </Tag>
              </div>

              {/* Dropdown chọn trạng thái */}
              <Select
                style={{ width: "100%" }}
                value={order.status || "pending"}
                onChange={handleChangeStatus}
                loading={isPending}
                options={[
                  { value: "pending", label: "Chờ xử lý" },
                  { value: "confirmed", label: "Đã xác nhận" },
                  { value: "shipped", label: "Đang giao hàng" },
                  { value: "delivered", label: "Đã giao thành công" },
                  { value: "cancelled", label: "Hủy đơn hàng" },
                ]}
              />
            </div>

            <Divider />

            {/* 2. TRẠNG THÁI THANH TOÁN */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <DollarOutlined /> Thanh toán
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text>Trạng thái:</Text>
                <Tag color={order.isPaid ? "green" : "orange"}>
                  {order.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                </Tag>
              </div>
              {!order.isPaid && (
                <ButtonComponent
                  type="primary"
                  ghost
                  style={{ width: "100%" }}
                  onClick={handleUpdatePaid}
                  loading={isPending}
                  textButton={"Xác nhận Đã Thanh Toán"}
                />
              )}
            </div>
          </Card>

          <Card title="Thông tin Khách hàng" bordered={false}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar size="large" icon={<UserOutlined />} />
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {order.customerInfo?.fullName || "Khách vãng lai"}
                </div>
                <div style={{ color: "#888" }}>{order.customerInfo?.email}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOrderDetails;
