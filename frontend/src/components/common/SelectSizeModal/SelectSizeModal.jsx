import React, { useState, useEffect, useMemo } from "react";
import { Modal, Row, Col, Space, Typography, InputNumber } from "antd";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { ShoppingCartOutlined } from "@ant-design/icons";

const SelectSizeModal = ({ product, isOpen, onClose, onConfirmAddToCart }) => {
  // State nội bộ của Modal
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Tính toán giá (sao chép từ CardComponent)
  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    return product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
  }, [product]);

  // useEffect để reset state khi một SẢN PHẨM MỚI được truyền vào
  useEffect(() => {
    if (product && product.hasSizes) {
      // Tự động chọn size đầu tiên còn hàng
      const firstAvailableSize = product.sizes.find((s) => s.quantity > 0);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size);
      } else {
        setSelectedSize(product.sizes[0]?.size); // Chọn tạm size đầu
      }
      setQuantity(1); // Reset số lượng về 1
    }
  }, [product]); // Chỉ chạy khi `product` thay đổi

  // Lấy dữ liệu cho size đang được chọn
  const selectedSizeData = useMemo(() => {
    if (!product || !selectedSize) return null;
    return product.sizes.find((s) => s.size === selectedSize);
  }, [product, selectedSize]);

  const maxQuantity = selectedSizeData?.quantity || 0;
  const isSizeAvailable = maxQuantity > 0;

  // Hàm xử lý đóng
  const handleClose = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra <Link>
    onClose(); // Gọi hàm onClose từ component cha
  };

  // Hàm xử lý xác nhận
  const handleConfirm = (e) => {
    e.stopPropagation();
    // Gọi hàm onConfirm từ cha, trả về size và số lượng đã chọn
    onConfirmAddToCart(selectedSize, quantity);
  };

  // Nếu không có product, không render gì cả
  if (!product) return null;

  return (
    <Modal
      title={product.name}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <ButtonComponent
          key="submit"
          type="primary"
          textButton="Thêm vào giỏ"
          icon={<ShoppingCartOutlined />}
          onClick={handleConfirm}
          disabled={!isSizeAvailable}
          className="add-to-cart-btn"
        />,
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </Col>
        <Col span={16}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div className="product-price" style={{ marginBottom: 0 }}>
              <span className="current-price">
                {discountedPrice.toLocaleString()}đ
              </span>
              {product.discount > 0 && (
                <span className="original-price" style={{ marginLeft: 8 }}>
                  {product.price.toLocaleString()}đ
                </span>
              )}
            </div>
            {/* Khối chọn size */}
            <div className="option-group">
              <label className="option-label">Kích thước: {selectedSize}</label>
              <div className="size-options">
                {product.sizes.map((sizeItem) => (
                  <div
                    key={sizeItem.size}
                    className={`size-option ${
                      selectedSize === sizeItem.size ? "active" : ""
                    } ${sizeItem.quantity === 0 ? "disabled" : ""}`}
                    onClick={() =>
                      sizeItem.quantity > 0 && setSelectedSize(sizeItem.size)
                    }
                  >
                    {sizeItem.size}
                    {sizeItem.quantity === 0 && (
                      <div className="size-sold-out">✕</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Khối chọn số lượng */}
            <div className="option-group">
              <label className="option-label">Số lượng</label>
              <div className="quantity-row">
                <InputNumber
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={setQuantity}
                  className="quantity-input"
                  disabled={!isSizeAvailable}
                />

                <span
                  className={`stock-status ${
                    isSizeAvailable ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {isSizeAvailable ? `Còn ${maxQuantity} sản phẩm` : "Hết hàng"}
                </span>
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectSizeModal;
