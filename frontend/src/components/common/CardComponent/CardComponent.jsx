import React, { useState } from "react";
import { Card, Typography, Badge, Space } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import "./CardComponent.css";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCart } from "../../../redux/slides/cartSlide";
import * as CartService from "../../../services/CartService";
import { useMessageApi } from "../../../context/MessageContext";
import SelectSizeModal from "../SelectSizeModal/SelectSizeModal";

const { Title, Text } = Typography;
const { Meta } = Card;

const CardComponent = ({ product }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useMessageApi();
  const user = useSelector((state) => state.user);
  const guestCart = useSelector((state) => state.cart);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleOpenModal = (e) => {
    // Ngăn thẻ <Link> (cha) bị kích hoạt
    e.preventDefault();
    e.stopPropagation();

    if (product.hasSizes) {
      // Nếu CÓ size, mở Modal để chọn
      // Tự động chọn size đầu tiên còn hàng
      const firstAvailableSize = product.sizes.find((s) => s.quantity > 0);
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

  //  4. TẠO HÀM "THÊM VÀO GIỎ" (TỪ MODAL HOẶC THÊM TRỰC TIẾP)
  const handleAddToCart = async (size, qty) => {
    let maxQuantity = 0;
    if (product.hasSizes) {
      const sizeData = product.sizes.find((s) => s.size === size);
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
      slug: product.slug,
      maxQuantity: maxQuantity, // Gửi kèm để kiểm tra sau này
    };

    // Phân luồng User (API) và Guest (Redux)
    if (user?.id) {
      // --- USER ĐÃ ĐĂNG NHẬP ---
      try {
        const res = await CartService.addToCart(itemToAdd);
        if (res.status === "OK") {
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
        showError(
          `Số lượng trong giỏ vượt quá tồn kho (Chỉ còn ${maxQuantity} sản phẩm).`
        );
        return;
      }
      dispatch(addToCart(itemToAdd));
      showSuccess("Đã thêm vào giỏ hàng!");
      setIsModalOpen(false); // Đóng modal sau khi thêm thành công
    }
  };

  const discountedPrice =
    product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

  const isSoldOut = product.inventoryStatus === "Hết hàng";

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        key={product._id}
        className="product-link-wrapper"
      >
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
                {product.isNewProduct && <Badge count="Mới" color="#52c41a" />}
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
      {/*  6. THÊM MODAL CHỌN SIZE */}
      <SelectSizeModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmAddToCart={handleAddToCart}
      />
    </>
  );
};

export default React.memo(CardComponent);
