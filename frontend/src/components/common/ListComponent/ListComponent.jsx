import React from "react";
import { List, Image, Badge, Button, Space, Typography } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
        const isSoldOut = item.inventoryStatus === "Hết hàng";
        return (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05, // hiệu ứng delay nhẹ giữa các item
            }}
            whileHover={{
              scale: 1.02, // Phóng to nhẹ
              y: -4, // Nhấc lên một chút
              zIndex: 1, // Đảm bảo nó nổi lên trên các item khác
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Thêm bóng đổ
              transition: { duration: 0.15, ease: "easeInOut" },
            }}
            className="motion-list-item-wrapper" // Thêm class để set position
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
              <Link to={`/product/${item.slug}`} className="product-list-link">
                <List.Item.Meta
                  avatar={
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      preview={false}
                    />
                  }
                  title={<span className="product-title">{item.name}</span>}
                  description={
                    <Space direction="vertical" size={4}>
                      <Text>{item.category?.name}</Text>
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
                            backgroundColor: item.isNew
                              ? "#47c41aff"
                              : "#fa8c16",
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
                        {!item.hasSizes
                          ? "Free Size"
                          : item.sizes
                              .filter((s) => s.quantity > 0)
                              .map((s) => s.size)
                              .join(", ") || "Hết kích cỡ"}
                      </Text>
                    </Space>
                  }
                />
              </Link>
            </List.Item>
          </motion.div>
        );
      }}
    />
  );
};

export default React.memo(ListComponent);
