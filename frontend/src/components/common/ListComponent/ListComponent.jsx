import React from "react";
import { List, Image, Badge, Button, Space, Typography } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

import "./ListComponent.css";

const { Text } = Typography;

const ListComponent = ({ products }) => {
  if (!Array.isArray(products) || products.length === 0) {
    return <div>Không có sản phẩm để hiển thị</div>;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={products}
      renderItem={(item, index) => {
        if (!item || !item.name || !item.image) {
          // console.warn("Dữ liệu sản phẩm không hợp lệ:", item);
          return null;
        }

        const originalPrice =
          item.discount > 0
            ? Math.round(item.price / (1 - item.discount / 100))
            : null;
        const isSoldOut = item.status === "Hết hàng";

        return (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05, // hiệu ứng delay nhẹ giữa các item
            }}
          >
            <List.Item
              className={`product-list-item ${isSoldOut ? "sold-out" : ""}`}
              actions={[
                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  disabled={isSoldOut}
                  key="wishlist"
                />,
                !isSoldOut && (
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    style={{ backgroundColor: "#000000a8" }}
                    key="add-to-cart"
                  ></Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={item.image} alt={item.name} width={100} />}
                title={<span className="product-title">{item.name}</span>}
                description={
                  <Space direction="vertical" size={4}>
                    <Text>{item.category}</Text>
                    <Space direction="vertical" size={2}>
                      <Text strong style={{ color: "#fa8c16" }}>
                        {item.price.toLocaleString()}đ
                      </Text>
                      {originalPrice && (
                        <Space size={8}>
                          <Text delete style={{ color: "#bfbfbf" }}>
                            {originalPrice.toLocaleString()}đ
                          </Text>
                          <Text style={{ color: "#52c41a" }}>
                            -{item.discount}%
                          </Text>
                        </Space>
                      )}
                    </Space>
                    {item.badge && (
                      <Badge
                        count={item.badge}
                        style={{
                          backgroundColor: item.isNew ? "#47c41aff" : "#fa8c16",
                        }}
                      />
                    )}
                    {isSoldOut && (
                      <Badge
                        count="Hết hàng"
                        style={{ backgroundColor: "#bfbfbf" }}
                      />
                    )}
                    <Text>
                      Kích cỡ:{" "}
                      {item.sizes
                        .filter((s) => s.quantity > 0)
                        .map((s) => s.size)
                        .join(", ") || "Hết kích cỡ"}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          </motion.div>
        );
      }}
    />
  );
};

export default React.memo(ListComponent);
