import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  InputNumber,
  Empty,
  Space,
  Card,
  Row,
  Col,
  Layout,
  Typography,
  message,
} from "antd";

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

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      setItems(
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleCheckout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/checkout";
    }, 500);
  };

  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "40%",
      render: (text, record) => (
        <Space>
          <img
            src={record.image || "/placeholder.svg"}
            alt={text}
            style={{
              width: "80px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <div>
            <div style={{ fontWeight: "500", marginBottom: "4px" }}>{text}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Màu: {record.color} | Size: {record.size}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (price) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(record.id, record.quantity - 1)}
          />
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(value) => handleQuantityChange(record.id, value)}
            style={{ width: "60px", textAlign: "center" }}
          />
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(record.id, record.quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: "Tổng cộng",
      key: "total",
      width: "15%",
      render: (_, record) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(record.price * record.quantity)}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
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
            to="/"
            style={{
              color: "#fa8c16",
              textDecoration: "none",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>

          <div style={{ marginBottom: "32px" }}>
            <Title level={2} style={{ color: "#262626", marginBottom: "8px" }}>
              <ShoppingOutlined /> Giỏ hàng của bạn
            </Title>
            <Text type="secondary">
              Bạn có {items.length} sản phẩm trong giỏ hàng
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {items.length === 0 ? (
                <motion.div variants={itemVariants}>
                  <Card style={{ textAlign: "center", padding: "60px 40px" }}>
                    <Empty
                      description="Giỏ hàng của bạn đang trống"
                      style={{ margin: "20px 0" }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        marginTop: "20px",
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                      }}
                    >
                      <Link
                        to="/products"
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        Tiếp tục mua sắm
                      </Link>
                    </Button>
                  </Card>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Card>
                    <Table
                      columns={cartColumns}
                      dataSource={items}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  </Card>
                </motion.div>
              )}
            </Col>

            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants}>
                <Card
                  title="Tóm tắt đơn hàng"
                  style={{ position: "sticky", top: "100px" }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Tiền hàng:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(totalPrice)}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Phí vận chuyển:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(0)}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Giảm giá:</Text>
                      <Text style={{ color: "#f5222d" }}>
                        -
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(0)}
                      </Text>
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
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(totalPrice)}
                      </Title>
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      loading={isLoading}
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                      style={{
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                      }}
                    >
                      Tiến hành thanh toán
                    </Button>

                    <Button
                      block
                      size="large"
                      style={{
                        height: "48px",
                        fontSize: "16px",
                      }}
                    >
                      <Link
                        to="/products"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        Tiếp tục mua sắm
                      </Link>
                    </Button>
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
