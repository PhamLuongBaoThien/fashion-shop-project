import { useState, useEffect, useRef } from "react"; // Thêm useRef
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
  EnvironmentOutlined,
  CarOutlined,
  DollarOutlined
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
import html2canvas from "html2canvas"; // Import mới
import jsPDF from "jspdf";             // Import mới

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

// --- HELPER: Render trạng thái chi tiết ---
const renderOrderStatus = (order) => {
    if (!order) return null;
    const status = order.status || 'pending'; 
    
    let color = 'default';
    let text = 'Chờ xử lý';
    let icon = <SyncOutlined spin />;

    switch (status) {
        case 'pending':
            color = 'orange';
            text = 'Chờ xử lý';
            break;
        case 'confirmed':
            color = 'geekblue';
            text = 'Đã xác nhận';
            icon = <CheckCircleOutlined />;
            break;
        case 'shipped':
            color = 'blue';
            text = 'Đang giao hàng';
            icon = <CarOutlined />;
            break;
        case 'delivered':
            color = 'green';
            text = 'Giao thành công';
            icon = <CheckCircleOutlined />;
            break;
        case 'cancelled':
            color = 'red';
            text = 'Đã hủy';
            icon = <CloseCircleOutlined />;
            break;
        default:
            color = 'default';
            text = 'Chờ xử lý';
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            <Tag icon={icon} color={color}>{text}</Tag>
            {order.isPaid ? (
                <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag>
            ) : (
                <Tag icon={<DollarOutlined />} color="warning">Chưa thanh toán</Tag>
            )}
        </div>
    );
};

export default function MyOrderDetailsPage() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tạo Ref để tham chiếu đến phần tử muốn in
  const invoiceRef = useRef(null); 

  const messageApi = useMessageApi();
  const showError = messageApi?.showError || ((msg) => console.error(msg));
  const showSuccess = messageApi?.showSuccess || ((msg) => console.log(msg));

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
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // --- HÀM XUẤT PDF ---
  const handleDownload = () => {
    const input = invoiceRef.current;
    if (!input) return;

    // Hiển thị loading nhẹ (nếu muốn)
    // messageApi.loading("Đang tạo PDF...");

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      
      // Khổ giấy A4: 210mm x 297mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Tính toán tỷ lệ ảnh để vừa khít chiều rộng A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30; // Cách lề trên 30mm

      // Thêm ảnh vào PDF
      // Tính toán chiều cao thực tế sau khi scale theo chiều rộng trang A4
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfImgHeight);
      pdf.save(`Order_${order._id}.pdf`);
      
      showSuccess("Tải hóa đơn thành công!");
    }).catch((err) => {
        console.error("Lỗi xuất PDF:", err);
        showError("Không thể tạo file PDF");
    });
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

          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} lg={16}>
              <motion.div variants={itemVariants}>
                
                {/* GẮN REF VÀO ĐÂY ĐỂ CHỤP ẢNH PHẦN NÀY */}
                <div ref={invoiceRef}> 
                    <Card title={`Đơn hàng #${order._id ? order._id.slice(-6).toUpperCase() : 'NA'}`}>
                    
                    {/* --- PHẦN THÔNG TIN CHUNG --- */}
                    <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                        <Col xs={12} sm={6}>
                        <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                            TRẠNG THÁI
                            </Text>
                            <div style={{ marginTop: "8px" }}>
                            {renderOrderStatus(order)}
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
                            <div style={{fontSize: 12, color: '#888'}}>
                                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("vi-VN") : ""}
                            </div>
                            </div>
                        </div>
                        </Col>
                        <Col xs={12} sm={6}>
                        <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                            THANH TOÁN
                            </Text>
                            <div style={{ marginTop: "8px", fontWeight: "500" }}>
                            <Tag color={order.paymentMethod === "cod" ? "cyan" : "purple"}>
                                    {order.paymentMethod === "cod" ? "COD" : order.paymentMethod?.toUpperCase()}
                            </Tag>
                            </div>
                        </div>
                        </Col>
                        <Col xs={12} sm={6}>
                        <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                            PHÍ VẬN CHUYỂN
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

                    {/* --- THÔNG TIN NGƯỜI MUA & NGƯỜI NHẬN --- */}
                    <Row gutter={24}>
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
                </div>
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