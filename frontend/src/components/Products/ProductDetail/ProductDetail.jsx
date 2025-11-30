import React, { useState, useEffect } from "react";
import {
  Rate,
  InputNumber,
  Tabs,
  Divider,
  Tag,
  Row,
  Col,
  Empty,
  Spin,
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as ProductService from "../../../services/ProductService";
import ImageGallery from "../../sections/ImageGallery/ImageGallery";
import CardProduct from "../../common/CardComponent/CardComponent";
import "./ProductDetail.css";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCart } from "../../../redux/slides/cartSlide";
import * as CartService from "../../../services/CartService";
import { useMessageApi } from "../../../context/MessageContext";
import { useLocation, useNavigate } from "react-router-dom";

const ProductDetail = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { showSuccess, showError } = useMessageApi();
  const user = useSelector((state) => state.user); // Lấy user để biết là "Khách" hay "User"
  const guestCart = useSelector((state) => state.cart); // Lấy giỏ hàng của "Khách"

  // useEffect để tự động chọn size đầu tiên còn hàng khi sản phẩm được tải
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      const firstAvailableSize = product.sizes.find((s) => s.quantity > 0);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size);
      } else {
        setSelectedSize(product.sizes[0].size); // Chọn size đầu tiên nếu tất cả đều hết hàng
      }
    }
  }, [product]); // Phụ thuộc vào `product`

  // Lấy sản phẩm liên quan sử dụng useInfiniteQuery
  const {
    data: relatedProductsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingRelated,
  } = useInfiniteQuery({
    queryKey: ["related-products", product.slug],
    queryFn: ({ pageParam = 1 }) =>
      ProductService.getRelatedProducts({
        slug: product.slug,
        pageParam,
        limit: 4, // Tải 4 sản phẩm mỗi lần
      }),
    // "Dạy" cho React Query cách lấy số trang tiếp theo
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.current;
      const totalPages = lastPage.pagination.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!product,
  });

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty description="Không tìm thấy thông tin sản phẩm." />
      </div>
    );
  }

  const discount = Number(product.discount) || 0;
  const discountedPrice =
    product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

  const galleryImages = [product.image, ...product.subImage];

  const isSoldOut = product.inventoryStatus === "Hết hàng";
  let maxQuantity = 0;
  let isSizeAvailable = false;

  if (product.hasSizes) {
    // Luồng 1: Có size
    const selectedSizeData = product.sizes.find((s) => s.size === selectedSize);
    maxQuantity = selectedSizeData?.quantity || 0;
    isSizeAvailable = maxQuantity > 0;
  } else {
    // Luồng 2: Không size (Nón)
    maxQuantity = product.stock;
    isSizeAvailable = product.stock > 0;
  }

  const tabItems = [
    {
      key: "description",
      label: "Mô tả sản phẩm",
      children: (
        <div
          className="tab-content"
          // Hiển thị HTML an toàn từ Rich Text Editor
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ),
    },
    {
      key: "reviews",
      label: `Đánh giá (${product.reviewCount || 0})`,
      children: (
        <div className="tab-content">
          <div className="review-summary">
            {/* ... (Code review của bạn) ... */}
            <div className="rating-overview">
              <div className="rating-score">{product.rating}</div>
              <Rate disabled defaultValue={product.rating} allowHalf />
              <div className="rating-count">{product.reviewCount} đánh giá</div>
            </div>
          </div>
          <Divider />
          <div className="review-list">
            {/* ... (Code review của bạn) ... */}
            <div className="review-item">
              <div className="review-header">
                <span className="reviewer-name">Nguyễn Văn A</span>
                <Rate disabled defaultValue={5} />
              </div>
              <p className="review-date">15/03/2024</p>
              <p className="review-content">
                Chất lượng áo rất tốt, vải mềm mại và thoáng mát. Form áo vừa
                vặn, đúng size. Sẽ ủng hộ shop lần sau.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "shipping",
      label: "Vận chuyển",
      children: (
        <div className="tab-content">
          <h3>Chính sách vận chuyển</h3>
          <ul>
            <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</li>
            <li>Giao hàng toàn quốc trong 2-5 ngày</li>
            <li>Giao hàng nhanh trong nội thành trong 24h</li>
            <li>Kiểm tra hàng trước khi thanh toán</li>
          </ul>
          <h3>Chính sách đổi trả</h3>
          <ul>
            <li>Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi</li>
            <li>Miễn phí đổi size trong 3 ngày đầu</li>
            <li>Sản phẩm chưa qua sử dụng, còn nguyên tem mác</li>
            <li>Hoàn tiền 100% nếu sản phẩm lỗi do nhà sản xuất</li>
          </ul>
        </div>
      ),
    },
  ];

  const handleAddToCart = async () => {
    if (product.hasSizes && !isSizeAvailable) {
      showError("Vui lòng chọn một size còn hàng.");
      return;
    }
    if (!product.hasSizes && isSoldOut) {
      showError("Sản phẩm này đã hết hàng.");
      return;
    }

    // Dữ liệu món hàng cần thêm
    const itemToAdd = {
      product: product._id, // Dùng _id từ API
      name: product.name,
      image: product.image,
      // Tính giá sau giảm tại thời điểm thêm
      price:
        product.discount > 0
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price,
      size: product.hasSizes ? selectedSize : "One Size", // Gửi "One Size" nếu là nón
      quantity: quantity,
      slug: product.slug,
      maxQuantity: maxQuantity, // Gửi kèm để kiểm tra sau này
    };

    // 6. LOGIC PHÂN LUỒNG (Quan trọng nhất)
    if (user?.id) {
      // --- LUỒNG 1: USER ĐÃ ĐĂNG NHẬP (Gọi API - Phần 1) ---
      try {
        const res = await CartService.addToCart(itemToAdd);
        if (res.status === "OK") {
          showSuccess(res.message);
          // Cập nhật lại Redux với toàn bộ giỏ hàng mới nhất từ DB
          dispatch(setCart(res.data.items));
        } else {
          showError(res.message);
        }
      } catch (e) {
        const errorMessage = e.response?.data?.message || e.message;
        showError(errorMessage);
      }
    } else {
      // --- LUỒNG 2: KHÁCH VÃNG LAI (Kiểm tra thủ công) ---

      // Tìm món hàng (với đúng size) trong giỏ hàng "khách"
      const existingItem = guestCart.cartItems.find(
        (i) => i.product === itemToAdd.product && i.size === itemToAdd.size
      );

      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantityInCart + itemToAdd.quantity;

      // maxQuantity đã được bạn tính ở trên (rất tốt!)
      if (newTotalQuantity > maxQuantity) {
        showError(
          `Số lượng trong giỏ (${newTotalQuantity}) vượt quá tồn kho (Chỉ còn ${maxQuantity} sản phẩm).`
        );
        return; // Dừng lại
      }

      // Nếu tất cả kiểm tra đều qua
      dispatch(addToCart(itemToAdd));
      showSuccess("Đã thêm vào giỏ hàng!");
    }
  };
  const handleBuyNow = () => {
    // 1. Kiểm tra đăng nhập (Nếu chưa thì đá về login)
    // if (!user?.id) {
    //   navigate("/sign-in", { state: location?.pathname });
    //   return;
    // }

    if (user?.isAdmin) {
        showError("Tài khoản Admin không được phép mua hàng!");
        return;
    }

    // 2. Kiểm tra size & tồn kho
    if (product.hasSizes && !isSizeAvailable) {
      showError("Vui lòng chọn một size còn hàng.");
      return;
    }
    if (!product.hasSizes && isSoldOut) {
      showError("Sản phẩm này đã hết hàng.");
      return;
    }

    // 3. Tạo dữ liệu món hàng (Cấu trúc Y HỆT item trong giỏ hàng Redux)
    const buyNowItem = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: discountedPrice, // Dùng giá đã giảm
      originPrice: product.price, // Giá gốc (để tham khảo nếu cần)
      discount: product.discount,
      size: product.hasSizes ? selectedSize : "One Size",
      quantity: quantity, // Số lượng đang chọn ở input
      slug: product.slug,
      countInStock: maxQuantity, // Tồn kho hiện tại để validate bên checkout
      hasSizes: product.hasSizes, // Để backend biết đường trừ kho
    };

    // 4. Điều hướng sang Checkout và GỬI KÈM dữ liệu qua 'state'
    navigate("/checkout", { state: { buyNowItem: buyNowItem } });
  };

  return (
    <>
      <div className="product-detail-page">
        <div className="product-detail-container">
          <Row gutter={[32, 32]} className="product-main">
            <Col xs={24} lg={12}>
              <div className="product-gallery">
                <ImageGallery images={galleryImages} />
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="product-info">
                <div className="product-header">
                  <h1 className="product-name">{product.name}</h1>
                  <div className="product-actions-mobile">
                    <ButtonComponent
                      type="text"
                      icon={<HeartOutlined />}
                      className={isFavorite ? "favorite active" : "favorite"}
                      onClick={() => setIsFavorite(!isFavorite)}
                    />
                    <ButtonComponent type="text" icon={<ShareAltOutlined />} />
                  </div>
                </div>

                <div className="product-rating">
                  <Rate disabled defaultValue={product.rating} allowHalf />
                  <span className="rating-text">
                    {product.rating} ({product.reviewCount} đánh giá)
                  </span>
                </div>

                <div className="product-actions-desktop">
                  <ButtonComponent
                    type="text"
                    icon={<HeartOutlined />}
                    className={isFavorite ? "favorite active" : "favorite"}
                    onClick={() => setIsFavorite(!isFavorite)}
                    textButton="Yêu thích"
                  />
                  <ButtonComponent
                    type="text"
                    icon={<ShareAltOutlined />}
                    textButton="Chia sẻ"
                  />
                </div>

                <div className="product-price">
                  <span className="current-price">
                    {discountedPrice.toLocaleString("vi-VN")}đ
                  </span>
                  {isSoldOut && <Tag color="#bfbfbf">Hết hàng</Tag>}

                  {discount > 0 && (
                    <>
                      <span className="original-price">
                        {product.price.toLocaleString("vi-VN")}đ
                      </span>
                      <Tag color="red" className="discount-tag">
                        -{product.discount}%
                      </Tag>
                    </>
                  )}
                  {product.isNewProduct && !isSoldOut && (
                    <Tag color="green" className="discount-tag">
                      Mới
                    </Tag>
                  )}
                </div>

                <Divider />

                <div className="product-options">
                  {product.hasSizes && (
                    <div className="option-group">
                      <label className="option-label">
                        Kích thước: {selectedSize}
                      </label>
                      <div className="size-options">
                        {product.sizes.map((sizeItem) => (
                          <div
                            key={sizeItem.size}
                            className={`size-option ${
                              selectedSize === sizeItem.size ? "active" : ""
                            } ${sizeItem.quantity === 0 ? "disabled" : ""}`}
                            onClick={() =>
                              sizeItem.quantity > 0 &&
                              setSelectedSize(sizeItem.size)
                            }
                            title={
                              sizeItem.quantity === 0
                                ? "Hết hàng"
                                : `Còn ${sizeItem.quantity} sản phẩm`
                            }
                          >
                            {sizeItem.size}
                            {sizeItem.quantity === 0 && (
                              <div className="size-sold-out">✕</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <span
                        className="size-guide"
                        onClick={() => setIsSizeGuideOpen(true)}
                      >
                        Hướng dẫn chọn size
                      </span>
                    </div>
                  )}
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
                        {product.hasSizes
                          ? isSizeAvailable
                            ? `Còn ${maxQuantity} sản phẩm`
                            : !selectedSize
                            ? "Vui lòng chọn size"
                            : "Hết hàng"
                          : product.stock > 0
                          ? `Còn ${product.stock} sản phẩm`
                          : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="product-actions">
                  <ButtonComponent
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    className="add-to-cart-btn"
                    disabled={
                      product.hasSizes ? !isSizeAvailable : product.stock <= 0
                    }
                    textButton="Thêm vào giỏ hàng"
                    block
                  />

                  <ButtonComponent
                    size="large"
                    onClick={handleBuyNow}
                    className="buy-now-btn"
                    disabled={
                      product.hasSizes ? !isSizeAvailable : product.stock <= 0
                    }
                    textButton="Mua ngay"
                    block
                  />
                </div>

                <div className="product-meta">
                  <div className="meta-item">
                    <span className="meta-label">Danh mục:</span>
                    <span className="meta-value">{product.category?.name}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Trạng thái:</span>
                    <span className="meta-value">
                      {product.inventoryStatus}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div className="product-details">
            <Tabs defaultActiveKey="description" items={tabItems} />
          </div>

          <div className="related-products">
            <h2 className="section-title">Sản phẩm liên quan</h2>
            <Row gutter={[16, 16]}>
              {relatedProductsData?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.data.map((relatedProd) => (
                    <Col key={relatedProd._id} xs={12} sm={12} md={8} lg={6}>
                      <CardProduct product={relatedProd} />
                    </Col>
                  ))}
                </React.Fragment>
              ))}
            </Row>
            {isLoadingRelated ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin />
              </div>
            ) : (
              hasNextPage && (
                <div className="load-more-container">
                  <ButtonComponent
                    type="primary"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="load-more-button"
                    textButton={isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Hướng dẫn chọn size"
        open={isSizeGuideOpen}
        onCancel={() => setIsSizeGuideOpen(false)}
        footer={[
          <ButtonComponent
            key="close"
            type="primary"
            onClick={() => setIsSizeGuideOpen(false)}
            textButton={"Đã hiểu"}
          />,
        ]}
        width={800} // Cho phép modal rộng hơn
      >
        <p>Bạn có thể thêm nội dung hướng dẫn chọn size ở đây.</p>
        <p>Ví dụ:</p>
        <ul>
          <li>
            <strong>Size S:</strong> Cân nặng 50-60kg, Cao 1m60 - 1m65
          </li>
          <li>
            <strong>Size M:</strong> Cân nặng 60-70kg, Cao 1m65 - 1m70
          </li>
          <li>
            <strong>Size L:</strong> Cân nặng 70-75kg, Cao 1m70 - 1m75
          </li>
          <li>
            <strong>Size XL:</strong> Cân nặng 75-85kg, Cao 1m75 - 1m80
          </li>
        </ul>
        <p>
          Lưu ý: Bảng size chỉ mang tính chất tham khảo, tùy thuộc vào số đo cơ
          thể và chất liệu vải.
        </p>
        {/* Hoặc bạn có thể chèn một ảnh bảng size tại đây */}
        {/* <img src="/path/to/size-chart.png" alt="Bảng size" style={{ width: '100%' }} /> */}
      </Modal>
    </>
  );
};

export default ProductDetail;
