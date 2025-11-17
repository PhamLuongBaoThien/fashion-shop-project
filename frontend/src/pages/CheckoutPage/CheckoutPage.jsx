import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import {
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Layout,
  Typography,
  Space,
  Steps,
  Radio,
  Divider,
  message,
} from "antd"

const { Content } = Layout
const { Title, Text } = Typography

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function CheckoutPage() {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [orderPlaced, setOrderPlaced] = useState(false)

  const shippingCosts = {
    standard: 30000,
    express: 60000,
    overnight: 100000,
  }

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartItems = JSON.parse(savedCart)
      setItems(cartItems)
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      setTotalPrice(total)
    }
  }, [])

  const handlePlaceOrder = async (values) => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      message.success("Đặt hàng thành công!")
      setCurrentStep(2)
      setOrderPlaced(true)
      localStorage.removeItem("cart")
    } catch (error) {
      message.error("Lỗi khi đặt hàng!")
    } finally {
      setIsProcessing(false)
    }
  }

  const finalTotal = totalPrice + shippingCosts[shippingMethod]

  if (orderPlaced) {
    return (
      <Content style={{ padding: "100px 24px 40px", minHeight: "100vh", backgroundColor: "#fafafa" }}>
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <Card style={{ textAlign: "center", padding: "60px 40px" }}>
              <motion.div
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: "24px" }}
              >
                <CheckCircleOutlined style={{ fontSize: "80px", color: "#52c41a" }} />
              </motion.div>
              <Title level={2} style={{ color: "#262626", marginBottom: "16px" }}>
                Đặt hàng thành công!
              </Title>
              <Text type="secondary" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                Cảm ơn bạn đã mua hàng. Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút.
              </Text>
              <div style={{ marginTop: "40px" }}>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#fa8c16",
                      borderColor: "#fa8c16",
                      height: "48px",
                      fontSize: "16px",
                    }}
                  >
                    <Link to="/products" style={{ color: "white", textDecoration: "none" }}>
                      Tiếp tục mua sắm
                    </Link>
                  </Button>
                  <Button size="large" style={{ height: "48px", fontSize: "16px" }}>
                    <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                      Về trang chủ
                    </Link>
                  </Button>
                </Space>
              </div>
            </Card>
          </div>
        </motion.div>
      </Content>
    )
  }

  return (
    <Content style={{ padding: "100px 24px 40px", minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link
            to="/cart"
            style={{
              color: "#fa8c16",
              textDecoration: "none",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeftOutlined /> Quay lại giỏ hàng
          </Link>

          <Title level={2} style={{ color: "#262626", marginBottom: "32px" }}>
            Thanh toán
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <motion.div variants={itemVariants}>
                <Card>
                  <Steps
                    current={currentStep}
                    items={[
                      { title: "Thông tin giao hàng", icon: <EnvironmentOutlined /> },
                      { title: "Xác nhận thanh toán", icon: <CreditCardOutlined /> },
                      { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
                    ]}
                    style={{ marginBottom: "32px" }}
                  />

                  {currentStep === 0 && (
                    <Form form={form} layout="vertical" size="large" onFinish={() => setCurrentStep(1)}>
                      <Title level={4} style={{ marginBottom: "24px" }}>
                        Thông tin nhận hàng
                      </Title>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="firstName"
                            label="Họ"
                            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Họ" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="lastName"
                            label="Tên"
                            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                          >
                            <Input placeholder="Tên" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                      </Form.Item>

                      <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                      >
                        <Input prefix={<EnvironmentOutlined />} placeholder="Địa chỉ chi tiết" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="city"
                            label="Thành phố"
                            rules={[{ required: true, message: "Vui lòng chọn thành phố!" }]}
                          >
                            <Select placeholder="Chọn thành phố">
                              <Select.Option value="hcm">TP. Hồ Chí Minh</Select.Option>
                              <Select.Option value="hn">Hà Nội</Select.Option>
                              <Select.Option value="dn">Đà Nẵng</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="postalCode"
                            label="Mã bưu điện"
                            rules={[{ required: true, message: "Vui lòng nhập mã bưu điện!" }]}
                          >
                            <Input placeholder="Mã bưu điện" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider />

                      <Title level={4} style={{ marginBottom: "24px" }}>
                        Phương thức vận chuyển
                      </Title>

                      <Radio.Group value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: "8px",
                              padding: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Radio value="standard">
                              <div>
                                <Text strong>Vận chuyển tiêu chuẩn (3-5 ngày)</Text>
                                <div style={{ fontSize: "12px", color: "#999" }}>Giao hàng trong 3-5 ngày làm việc</div>
                              </div>
                            </Radio>
                            <Text>
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(30000)}
                            </Text>
                          </div>

                          <div
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: "8px",
                              padding: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Radio value="express">
                              <div>
                                <Text strong>Vận chuyển nhanh (1-2 ngày)</Text>
                                <div style={{ fontSize: "12px", color: "#999" }}>Giao hàng trong 1-2 ngày làm việc</div>
                              </div>
                            </Radio>
                            <Text>
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(60000)}
                            </Text>
                          </div>

                          <div
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: "8px",
                              padding: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Radio value="overnight">
                              <div>
                                <Text strong>Vận chuyển qua đêm (giao hôm sau)</Text>
                                <div style={{ fontSize: "12px", color: "#999" }}>Giao hàng vào sáng hôm sau</div>
                              </div>
                            </Radio>
                            <Text>
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(100000)}
                            </Text>
                          </div>
                        </Space>
                      </Radio.Group>

                      <Form.Item style={{ marginTop: "24px" }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          style={{
                            backgroundColor: "#fa8c16",
                            borderColor: "#fa8c16",
                            height: "48px",
                            fontSize: "16px",
                          }}
                        >
                          Tiếp tục thanh toán
                        </Button>
                      </Form.Item>
                    </Form>
                  )}

                  {currentStep === 1 && (
                    <Form layout="vertical" size="large" onFinish={handlePlaceOrder}>
                      <Title level={4} style={{ marginBottom: "24px" }}>
                        Thông tin thanh toán
                      </Title>

                      <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Radio value="card">
                            <Text strong>Thanh toán bằng thẻ tín dụng</Text>
                          </Radio>
                          <Radio value="bank">
                            <Text strong>Chuyển khoản ngân hàng</Text>
                          </Radio>
                          <Radio value="cod">
                            <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                          </Radio>
                        </Space>
                      </Radio.Group>

                      {paymentMethod === "card" && (
                        <div style={{ marginTop: "24px" }}>
                          <Form.Item label="Số thẻ" rules={[{ required: true, message: "Vui lòng nhập số thẻ!" }]}>
                            <Input prefix={<CreditCardOutlined />} placeholder="0000 0000 0000 0000" />
                          </Form.Item>

                          <Row gutter={16}>
                            <Col xs={12}>
                              <Form.Item
                                label="Hạn sử dụng"
                                rules={[{ required: true, message: "Vui lòng nhập hạn sử dụng!" }]}
                              >
                                <Input placeholder="MM/YY" />
                              </Form.Item>
                            </Col>
                            <Col xs={12}>
                              <Form.Item label="CVV" rules={[{ required: true, message: "Vui lòng nhập CVV!" }]}>
                                <Input placeholder="123" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      )}

                      <Divider />

                      <Space style={{ width: "100%", marginBottom: "24px", gap: "12px" }}>
                        <Button
                          block
                          size="large"
                          onClick={() => setCurrentStep(0)}
                          style={{ height: "48px", fontSize: "16px" }}
                        >
                          Quay lại
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={isProcessing}
                          size="large"
                          style={{
                            backgroundColor: "#fa8c16",
                            borderColor: "#fa8c16",
                            height: "48px",
                            fontSize: "16px",
                          }}
                        >
                          Đặt hàng
                        </Button>
                      </Space>
                    </Form>
                  )}
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div variants={itemVariants} style={{ position: "sticky", top: "100px" }}>
                <Card title="Đơn hàng của bạn" >
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <div>
                            <Text>{item.name}</Text>
                            <div style={{ fontSize: "12px", color: "#999" }}>x{item.quantity}</div>
                          </div>
                          <Text>
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              item.price * item.quantity,
                            )}
                          </Text>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text>Tiền hàng:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                      </Text>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text>Vận chuyển:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          shippingCosts[shippingMethod],
                        )}
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
                      <Title level={4} style={{ color: "#fa8c16", marginBottom: 0 }}>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}
                      </Title>
                    </div>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </Content>
  )
}
