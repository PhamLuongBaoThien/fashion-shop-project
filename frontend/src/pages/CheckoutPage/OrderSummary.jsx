import React from "react";
import { motion } from "framer-motion";
import { Card, Layout, Typography, Space } from "antd";

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

// Component chỉ render cột "Đơn hàng của bạn"
// Đây là "dumb component", chỉ nhận props và hiển thị
export default function OrderSummary({
  cartItems,
  itemsPrice,
  shippingCost,
  finalTotal,
}) {
  return (
    <motion.div
      variants={itemVariants}
      style={{ position: "sticky", top: "100px" }}
    >
      <Card title="Đơn hàng của bạn">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            {cartItems.map((item) => (
              <div
                key={item.product + item.size}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center", // Thêm align-items
                  marginBottom: "16px", // Tăng khoảng cách
                  paddingBottom: "16px", // Tăng khoảng cách

                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      // Fallback nếu ảnh lỗi
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/60x60/f0f0f0/999?text=Img";
                    }}
                  />
                  <div>
                    <Text>{item.name}</Text>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Size: {item.size} | x{item.quantity}
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      textAlign: "right",
                      marginLeft: "auto",
                    }}
                  >
                    <Text>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price * item.quantity)}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text>Tiền hàng:</Text>
            <Text>{itemsPrice.toLocaleString("vi-VN")}đ</Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Text>Vận chuyển:</Text>
            <Text>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(shippingCost)}
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
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(finalTotal)}
            </Title>
          </div>
        </Space>
      </Card>
    </motion.div>
  );
}
