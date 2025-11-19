import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import {
  Card,
  Layout,
  Typography,
  Table,
  Space,
  Button,
  Divider,
  Row,
  Col,
  Tag,
  Empty,
  Spin
} from "antd";

import * as OrderService from "../../services/OrderService";
import { useMessageApi } from "../../context/MessageContext";

const { Content } = Layout;
const { Title, Text } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const getStatusBadge = (order) => {
    if (!order) return null;
    if (order.isDelivered) {
        return <Tag icon={<CheckCircleOutlined />} color="green">Đã giao hàng</Tag>;
    } else if (order.isPaid) {
        return <Tag icon={<CheckCircleOutlined />} color="blue">Đã thanh toán</Tag>;
    } else {
        return <Tag icon={<SyncOutlined />} color="orange">Đang xử lý</Tag>;
    }
};

export default function MyOrderDetailsPage() {
  const { id } = useParams(); 
  
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const messageApi = useMessageApi();
  const showError = messageApi?.showError || ((msg) => console.error(msg));

  useEffect(() => {
    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await OrderService.getOrderDetails(id);
            if (res?.status === 'OK') {
                setOrder(res.data);
            } else {
                showError(res?.message || "Không thể tải thông tin đơn hàng");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            showError("Lỗi kết nối đến server");
        } finally {
            setLoading(false);
        }
    }

    if (id) {
        fetchOrderDetails();
    }
  }, [id, showError]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Tính năng download hóa đơn PDF sẽ sớm được cập nhật!");
  };

  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Đang tải đơn hàng..." />
        </div>
    );
  }

  if (!order) {
    return (
      <Content style={{ padding: "100px 24px", minHeight: "100vh", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Card style={{ textAlign: "center", padding: "60px 40px" }}>
            <Empty description="Không tìm thấy đơn hàng" />
            <Link to="/profile">
                <Button type="primary" style={{ marginTop: 16 }}>Quay lại</Button>
            </Link>
          </Card>
        </div>
      </Content>
    );
  }

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <Space>
          <img
            src={record.image || "/placeholder.svg"}
            alt={record.name}
            style={{
              width: "60px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x80?text=No+Img"; }}
          />
          <div>
            <div style={{ fontWeight: "500", marginBottom: "4px" }}>
              {record.name}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Size: {record.size === "One Size" ? "Free Size" : record.size}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      key: "price",
      render: (_, record) => <Text strong>{formatPrice(record.price)}</Text>,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => <Text>{record.quantity}</Text>,
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) => (
        <Text strong>{formatPrice(record.price * record.quantity)}</Text>
      ),
    },
  ];

  return (
    <Content
      style={{
        padding: "100px 24px 40px",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link
            to="/profile"
            style={{
              color: "#fa8c16",
              textDecoration: "none",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeftOutlined /> Quay lại danh sách đơn hàng
          </Link>

          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} lg={16}>
              <motion.div variants={itemVariants}>
                <Card title={`Đơn hàng #${order._id ? order._id.slice(-6).toUpperCase() : 'NA'}`}>
                  
                  {/* --- PHẦN THÔNG TIN CHUNG --- */}
                  <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                    <Col xs={12} sm={6}>
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          TRẠNG THÁI
                        </Text>
                        <div style={{ marginTop: "8px" }}>
                          {getStatusBadge(order)}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          NGÀY ĐẶT
                        </Text>
                        <div style={{ marginTop: "8px", fontWeight: "500" }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          THANH TOÁN
                        </Text>
                        <div style={{ marginTop: "8px", fontWeight: "500" }}>
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : "Chuyển khoản"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          PHÍ SHIP
                        </Text>
                        <div style={{ marginTop: "8px", fontWeight: "500" }}>
                          {formatPrice(order.shippingPrice || 0)}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Divider />

                  {/* --- DANH SÁCH SẢN PHẨM --- */}
                  <Title level={5}>Danh sách sản phẩm</Title>
                  <Table
                    columns={columns}
                    dataSource={order.orderItems || []}
                    rowKey={(record) => record._id || record.product}
                    pagination={false}
                    scroll={{ x: true }}
                    style={{ marginBottom: "24px" }}
                  />

                  <Divider />

                  {/* --- THÔNG TIN NGƯỜI MUA & NGƯỜI NHẬN (Đã cập nhật) --- */}
                  <Row gutter={24}>
                    {/* Cột Trái: Người Mua */}
                    <Col xs={24} md={12} style={{ marginBottom: '24px' }}>
                        <Title level={5}>
                            <UserOutlined style={{ marginRight: 8 }} /> 
                            Thông tin người mua
                        </Title>
                        <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', height: '100%' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <Text type="secondary">Họ và tên:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.customerInfo?.fullName}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <Text type="secondary">Email:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.customerInfo?.email}
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">Số điện thoại:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.customerInfo?.phone}
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Cột Phải: Người Nhận */}
                    <Col xs={24} md={12} style={{ marginBottom: '24px' }}>
                        <Title level={5}>
                             <EnvironmentOutlined style={{ marginRight: 8 }} />
                             Thông tin giao hàng
                        </Title>
                        <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', height: '100%' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <Text type="secondary">Người nhận:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.shippingInfo?.fullName}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <Text type="secondary">Số điện thoại:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.shippingInfo?.phone}
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">Địa chỉ:</Text>
                                <div style={{ fontWeight: "500", marginTop: "4px" }}>
                                    {order.shippingInfo?.detailAddress}, {order.shippingInfo?.ward}, {order.shippingInfo?.district}, {order.shippingInfo?.province}
                                </div>
                            </div>
                        </div>
                    </Col>
                  </Row>

                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div
                variants={itemVariants}
                style={{ position: "sticky", top: "100px" }}
              >
                <Card title="Tóm tắt đơn hàng">
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Tiền hàng:</Text>
                      <Text>{formatPrice(order.itemsPrice || 0)}</Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Phí vận chuyển:</Text>
                      <Text>{formatPrice(order.shippingPrice || 0)}</Text>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Title level={4} style={{ marginBottom: 0 }}>
                        Tổng cộng:
                      </Title>
                      <Title
                        level={4}
                        style={{ color: "#fa8c16", marginBottom: 0 }}
                      >
                        {formatPrice(order.totalPrice || 0)}
                      </Title>
                    </div>

                    <Space style={{ width: "100%" }}>
                      <Button
                        block
                        type="default"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                      >
                        In đơn hàng
                      </Button>
                      <Button
                        block
                        type="default"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                      >
                        Tải PDF
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </Content>
  );
}