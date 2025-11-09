import React from "react";
import { Card, Typography, Badge, Space } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import "./CardComponent.css";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { Link } from "react-router-dom";
const { Title, Text } = Typography;
const { Meta } = Card;

const CardComponent = ({ product }) => {
  const originalPrice =
    product.discount > 0
      ? Math.round(product.price / (1 - product.discount / 100))
      : null;

  const isSoldOut = product.inventoryStatus === "Hết hàng";

  return (
    <Link to={`/product/${product.slug}`} key={product._id} className="product-link-wrapper">
      <Card
      className={`product-card ${isSoldOut ? "sold-out" : ""}`}
      cover={
        <div className="product-image-wrapper">
          {/* Ảnh chính */}
          <div
            className="product-image main-img"
            style={{ backgroundImage: `url(${product.image})` }}
          />

          {/* Ảnh phụ: chỉ lấy ảnh đầu tiên */}
          {product.subImage?.length > 0 && (
            <div
              className="product-image sub-img"
              style={{ backgroundImage: `url(${product.subImage[0]})` }}
            />
          )}

          {/* Badge */}
          <div className="product-badges-container">
            {/* 1. Hiển thị badge 'Hết hàng' (Ưu tiên cao nhất) */}
            {isSoldOut && (
              <Badge
                count="Hết hàng"
                style={{ backgroundColor: "#bfbfbf", color: "#fff" }}
              />
            )}

            {/* 2. Hiển thị badge 'Giảm giá' */}
            {product.discount > 0 && (
              <Badge count={`-${product.discount}%`} color="#fa8c16" />
            )}

            {/* 3. Hiển thị badge 'Mới' */}
            {product.isNewProduct && (
              <Badge count="Mới" color="#52c41a" />
            )}
          </div>

          {/* Wishlist button */}
          <ButtonComponent
            type="text"
            size="small"
            className="wish-product-btn"
            icon={<HeartOutlined />}
            disabled={isSoldOut}
          />

          {/* Overlay khi hover */}
          {!isSoldOut && (
            <div className="product-overlay">
              <ButtonComponent
                textButton="Thêm vào giỏ"
                type="primary"
                icon={<ShoppingCartOutlined />}
              />
            </div>
          )}
        </div>
      }
    >
      <Meta
        title={
          <Title level={4} className="product-title">
            {product.name}
          </Title>
        }
        description={
          <Space>
            <Text className="product-price">
              {product.price.toLocaleString()}đ
            </Text>
            {originalPrice && (
              <>
                <Text delete className="product-old">
                  {originalPrice.toLocaleString()}đ
                </Text>
                {/* <Text style={{ color: "#52c41a", fontWeight: 600 }}>
                  -{product.discount}%
                </Text> */}
              </>
            )}
          </Space>
        }
      />
    </Card>
    </Link>
    
  );
};

export default React.memo(CardComponent);
