import React, { useState } from "react";
import { Card, Typography, Badge, Space, Modal, Rate, InputNumber, Row, Col } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import "./CardComponent.css";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCart } from "../../../redux/slides/cartSlide";
import * as CartService from '../../../services/CartService';
import { useMessageApi } from '../../../context/MessageContext';

const { Title, Text } = Typography;
const { Meta } = Card;

const CardComponent = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useMessageApi();
  const user = useSelector((state) => state.user);
  const guestCart = useSelector((state) => state.cart);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleOpenModal = (e) => {
    // Ngăn thẻ <Link> (cha) bị kích hoạt
    e.preventDefault();
    e.stopPropagation();
    
    if (product.hasSizes) {
      // Nếu CÓ size, mở Modal để chọn
      // Tự động chọn size đầu tiên còn hàng
      const firstAvailableSize = product.sizes.find(s => s.quantity > 0);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size);
      } else {
        setSelectedSize(product.sizes[0]?.size); // Chọn tạm size đầu nếu hết hàng
      }
      setIsModalOpen(true);
    } else {
      // Nếu KHÔNG size (Nón), thêm thẳng vào giỏ
      handleAddToCart("One Size", 1);
    }
  };

  // ✅ 4. TẠO HÀM "THÊM VÀO GIỎ" (TỪ MODAL HOẶC THÊM TRỰC TIẾP)
  const handleAddToCart = async (size, qty) => {
    
    let maxQuantity = 0;
    if (product.hasSizes) {
        const sizeData = product.sizes.find(s => s.size === size);
        maxQuantity = sizeData?.quantity || 0;
    } else {
        maxQuantity = product.stock;
    }

    if (qty > maxQuantity) {
        showError(`Số lượng vượt quá tồn kho (Chỉ còn ${maxQuantity} sản phẩm).`);
        return;
    }

    const itemToAdd = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: discountedPrice,
      size: size,
      quantity: qty,
    };

    // Phân luồng User (API) và Guest (Redux)
    if (user?.id) {
      // --- USER ĐÃ ĐĂNG NHẬP ---
      try {
        const res = await CartService.addToCart(itemToAdd);
        if (res.status === 'OK') {
          showSuccess(res.message);
          dispatch(setCart(res.data.items)); 
          setIsModalOpen(false); // Đóng modal sau khi thêm thành công
        } else {
          showError(res.message);
        }
      } catch (e) { 
        const errorMessage = e.response?.data?.message || e.message;
        showError(errorMessage);
       }
    } else {
      // --- KHÁCH VÃNG LAI (CHECK TỒN KHO THỦ CÔNG) ---
      const existingItem = guestCart.cartItems.find(
        (i) => i.product === itemToAdd.product && i.size === itemToAdd.size
      );
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

      if (currentQuantityInCart + itemToAdd.quantity > maxQuantity) {
        showError(`Số lượng trong giỏ vượt quá tồn kho (Chỉ còn ${maxQuantity} sản phẩm).`);
        return;
      }
      dispatch(addToCart(itemToAdd));
      showSuccess("Đã thêm vào giỏ hàng!");
      setIsModalOpen(false); // Đóng modal sau khi thêm thành công
    }
  };

  // Lấy dữ liệu cho size đang được chọn trong Modal
  const selectedSizeData = product.sizes.find((s) => s.size === selectedSize);
  const modalMaxQuantity = selectedSizeData?.quantity || 0;
  const isModalSizeAvailable = modalMaxQuantity > 0;

  const discountedPrice =
  product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const isSoldOut = product.inventoryStatus === "Hết hàng";

  return (
    <>
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
                onClick={handleOpenModal}
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
              {discountedPrice.toLocaleString()}đ
            </Text>
            {product.discount > 0 && (
              <>
                <Text delete className="product-old">
                  {product.price.toLocaleString()}đ
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

    {/* Modal chọn size và số lượng */}
    {/* ✅ 6. THÊM MODAL CHỌN SIZE */}
      <Modal
        title={product.name}
        open={isModalOpen}
        onCancel={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
        }}
        // Dùng `ButtonComponent` của bạn cho Footer
        footer={[
            <ButtonComponent 
              key="submit" 
              type="primary" 
              textButton="Thêm vào giỏ" 
              icon={<ShoppingCartOutlined />}
              className="add-to-cart-btn"
              onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(selectedSize, quantity);
              }}
              disabled={!isModalSizeAvailable}
            />
        ]}
      >
        {/* Nội dung bên trong Modal */}
        <Row gutter={[16, 16]}>
            <Col span={8}>
                <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
            </Col>
            <Col span={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="product-price" style={{ marginBottom: 0 }}>
                        <span className="current-price">{discountedPrice.toLocaleString()}đ</span>
                        {product.discount > 0 && (
                            <span className="original-price" style={{ marginLeft: 8 }}>{product.price.toLocaleString()}đ</span>
                        )}
                    </div>
                    
                    <div className="option-group">
                        <label className="option-label">Kích thước: {selectedSize}</label>
                        <div className="size-options">
                            {product.sizes.map((sizeItem) => (
                                <div
                                    key={sizeItem.size}
                                    className={`size-option ${selectedSize === sizeItem.size ? "active" : ""} ${sizeItem.quantity === 0 ? "disabled" : ""}`}
                                    onClick={() => sizeItem.quantity > 0 && setSelectedSize(sizeItem.size)}
                                >
                                    {sizeItem.size}
                                    {sizeItem.quantity === 0 && <div className="size-sold-out">✕</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="option-group">
                        <label className="option-label">Số lượng</label>
                        <div className="quantity-row">
                            <InputNumber
                                min={1}
                                max={modalMaxQuantity}
                                value={quantity}
                                onChange={setQuantity}
                                className="quantity-input"
                                disabled={!isModalSizeAvailable}
                            />
                            <span className={`stock-status ${isModalSizeAvailable ? "in-stock" : "out-of-stock"}`}>
                                {isModalSizeAvailable ? `Còn ${modalMaxQuantity} sản phẩm` : "Hết hàng"}
                            </span>
                        </div>
                    </div>
                </Space>
            </Col>
        </Row>
      </Modal>
    </>
  );
};

export default React.memo(CardComponent);
