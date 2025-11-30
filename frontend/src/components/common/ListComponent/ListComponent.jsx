import React, { useState } from "react";
import { List, Image, Badge, Button, Space, Typography } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./ListComponent.css";
import SelectSizeModal from "../SelectSizeModal/SelectSizeModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCart } from "../../../redux/slides/cartSlide";
import * as CartService from "../../../services/CartService";
import { useMessageApi } from "../../../context/MessageContext";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const { Text } = Typography;

const ListComponent = ({ products }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useMessageApi();
  const user = useSelector((state) => state.user);
  const guestCart = useSelector((state) => state.cart);

  // Sản phẩm đang chọn để mở Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedProduct(item); // Lưu sản phẩm đang chọn

    if (item.hasSizes) {
      const firstAvailableSize = item.sizes.find((s) => s.quantity > 0);
      setSelectedSize(
        firstAvailableSize ? firstAvailableSize.size : item.sizes[0]?.size
      );
      setIsModalOpen(true);
    } else {
      handleAddToCart(item, "One Size", 1);
    }
  };

  const handleAddToCart = async (product, size, qty) => {
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

    const discountedPrice =
      product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    const itemToAdd = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: discountedPrice,
      size: size,
      quantity: qty,
      slug: product.slug,
    };

    // --- USER ĐÃ ĐĂNG NHẬP ---
    if (user?.id) {
      try {
        const res = await CartService.addToCart(itemToAdd);
        if (res.status === "OK") {
          showSuccess(res.message);
          dispatch(setCart(res.data.items));
          setIsModalOpen(false);
        } else showError(res.message);
      } catch (e) {
        showError(e.response?.data?.message || e.message);
      }
      return;
    }

    // --- KHÁCH VÃNG LAI ---
    const existingItem = guestCart.cartItems.find(
      (i) => i.product === itemToAdd.product && i.size === itemToAdd.size
    );
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + qty > maxQuantity) {
      showError(
        `Số lượng trong giỏ vượt quá tồn kho (Chỉ còn ${maxQuantity} sản phẩm).`
      );
      return;
    }

    dispatch(addToCart(itemToAdd));
    showSuccess("Đã thêm vào giỏ hàng!");
    setIsModalOpen(false);
  };

  if (!Array.isArray(products) || products.length === 0) {
    return <div>Không có sản phẩm để hiển thị</div>;
  }

  return (
    <>
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
                    <ButtonComponent
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      style={{ backgroundColor: "#000000a8" }}
                      key="add-to-cart"
                      onClick={(e) => handleOpenModal(e, item)}
                    />
                  ),
                ]}
              >
                {/* dùng location.state để cập nhật tên lên BreadcrumbComponent */}
                <Link
                  to={`/product/${item.slug}`}
                  state={{ productName: item.name }}
                  className="product-list-link"
                >
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
      {selectedProduct && (
        <SelectSizeModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirmAddToCart={(size, qty) =>
            handleAddToCart(selectedProduct, size, qty)
          }
          />
        )}
    </>
  );
};

export default React.memo(ListComponent);
