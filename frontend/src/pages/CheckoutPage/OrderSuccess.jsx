import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Layout, Typography, Space } from "antd";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

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

// Component chỉ render màn hình "Đặt hàng thành công"
export default function OrderSuccess() {
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
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Card style={{ textAlign: "center", padding: "60px 40px" }}>
            <motion.div
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: "24px" }}
            >
              <CheckCircleOutlined
                style={{ fontSize: "80px", color: "#52c41a" }}
              />
            </motion.div>
            <Title level={2} style={{ color: "#262626", marginBottom: "16px" }}>
              Đặt hàng thành công!
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: "16px", lineHeight: "1.6" }}
            >
              Cảm ơn bạn đã mua hàng. Bạn sẽ nhận được email xác nhận đơn hàng
              trong vài phút.
            </Text>
            <div style={{ marginTop: "40px" }}>
              <Space>
                <Link
                  to="/products"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  <ButtonComponent
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#fa8c16",
                      borderColor: "#fa8c16",
                      height: "48px",
                      fontSize: "16px",
                    }}
                    textButton={"Tiếp tục mua sắm"}
                  />
                </Link>

                <Link
                  to="/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ButtonComponent
                    size="large"
                    style={{
                      height: "48px",
                      fontSize: "16px",
                      borderColor: "#1a1a1a",
                      color: "#1a1a1a",
                      border: "3px solid"
                    }}
                    textButton={"Về trang chủ"}
                  />
                </Link>
              </Space>
            </div>
          </Card>
        </div>
      </motion.div>
    </Content>
  );
}
