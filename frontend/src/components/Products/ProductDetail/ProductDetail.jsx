import { useState, useEffect } from "react"
import { Rate, InputNumber, Button, Tabs, Divider, Tag, Row, Col, Empty } from "antd"
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined } from "@ant-design/icons"
import ImageGallery from "../../sections/ImageGallery/ImageGallery"
import CardProduct from "../../common/CardComponent/CardComponent"
import "./ProductDetail.css"


const ProductDetail = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  // useEffect để tự động chọn size đầu tiên còn hàng khi sản phẩm được tải
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      const firstAvailableSize = product.sizes.find(s => s.quantity > 0);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size);
      } else {
        setSelectedSize(product.sizes[0].size); // Chọn size đầu tiên nếu tất cả đều hết hàng
      }
    }
  }, [product]); // Phụ thuộc vào `product`

    if (!product) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="Không tìm thấy thông tin sản phẩm." />
        </div>
    );
  }

  const originalPrice = product.discount > 0 ? Math.round(product.price / (1 - product.discount / 100)) : null

  const galleryImages = [product.image, ...product.subImage]

  const selectedSizeData = product.sizes.find((s) => s.size === selectedSize)
  const maxQuantity = selectedSizeData?.quantity || 0
  const isSoldOut = product.inventoryStatus === "Hết hàng";
  const isSizeAvailable = maxQuantity > 0

  const relatedProducts = [
    {
      id: 2,
      name: "Áo Polo Nam",
      price: 750000,
      image: "/classic-polo-shirt.png",
      rating: 4.3,
    },
    {
      id: 3,
      name: "Áo Sơ Mi Oxford",
      price: 950000,
      image: "/oxford-shirt.png",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Áo Hoodie Basic",
      price: 1200000,
      image: "/basic-hoodie.jpg",
      rating: 4.6,
    },
    {
      id: 5,
      name: "Áo Thun Oversize",
      price: 680000,
      image: "/oversize-tshirt.jpg",
      rating: 4.4,
    },
  ]



  const tabItems = [
    {
      key: "description",
      label: "Mô tả sản phẩm",
      children: (
        <div className="tab-content">
          <h3>Chi tiết sản phẩm</h3>
          <div 
            className="tab-content" 
            // Hiển thị HTML an toàn từ Rich Text Editor
            dangerouslySetInnerHTML={{ __html: product.description }} 
        />
        </div>
      ),
    },
    {
      key: "reviews",
      label: `Đánh giá (${product.reviewCount || 0})`,
      children: (
        <div className="tab-content">
          <div className="review-summary">
            {/* ... (Code review của bạn) ... */}
          </div>
          <Divider />
          <div className="review-list">
            {/* ... (Code review của bạn) ... */}
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
  ]

  const handleAddToCart = () => {
    if (!isSizeAvailable) {
      console.log("[v0] Size out of stock")
      return
    }
    console.log("[v0] Add to cart:", {
      product: product.id,
      size: selectedSize,
      quantity,
    })
  }

  const handleBuyNow = () => {
    if (!isSizeAvailable) {
      console.log("[v0] Size out of stock")
      return
    }
    console.log("[v0] Buy now:", {
      product: product.id,
      size: selectedSize,
      quantity,
    })
  }

  return (
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
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                    className={isFavorite ? "favorite active" : "favorite"}
                    onClick={() => setIsFavorite(!isFavorite)}
                  />
                  <Button type="text" icon={<ShareAltOutlined />} />
                </div>
              </div>

              {product.badge && (
                <div className="product-badges">
                {isSoldOut && <Tag color="#bfbfbf">Hết hàng</Tag>}
                {product.discount > 0 && !isSoldOut && <Tag color="red">Sale</Tag>}
                {product.isNewProduct && !isSoldOut && <Tag color="green">Mới</Tag>}
              </div>
              )}

              <div className="product-rating">
                <Rate disabled defaultValue={product.rating} allowHalf />
                <span className="rating-text">
                  {product.rating} ({product.reviewCount} đánh giá)
                </span>
              </div>

              <div className="product-price">
                <span className="current-price">{product.price.toLocaleString("vi-VN")}đ</span>
                {originalPrice && (
                  <>
                    <span className="original-price">{originalPrice.toLocaleString("vi-VN")}đ</span>
                    <Tag color="red" className="discount-tag">
                      -{product.discount}%
                    </Tag>
                  </>
                )}
              </div>

              <Divider />

              <div className="product-options">
                <div className="option-group">
                  <label className="option-label">Kích thước: {selectedSize}</label>
                  <div className="size-options">
                    {product.sizes.map((sizeItem) => (
                      <div
                        key={sizeItem.size}
                        className={`size-option ${selectedSize === sizeItem.size ? "active" : ""} ${
                          sizeItem.quantity === 0 ? "disabled" : ""
                        }`}
                        onClick={() => sizeItem.quantity > 0 && setSelectedSize(sizeItem.size)}
                        title={sizeItem.quantity === 0 ? "Hết hàng" : `Còn ${sizeItem.quantity} sản phẩm`}
                      >
                        {sizeItem.size}
                        {sizeItem.quantity === 0 && <div className="size-sold-out">✕</div>}
                      </div>
                    ))}
                  </div>
                  <a href="#" className="size-guide">
                    Hướng dẫn chọn size
                  </a>
                </div>

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
                    <span className={`stock-status ${isSizeAvailable ? "in-stock" : "out-of-stock"}`}>
                      {isSizeAvailable ? `Còn ${maxQuantity} sản phẩm` : "Hết hàng"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="product-actions">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                  disabled={!isSizeAvailable}
                  block
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button size="large" onClick={handleBuyNow} className="buy-now-btn" disabled={!isSizeAvailable} block>
                  Mua ngay
                </Button>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">SKU:</span>
                  <span className="meta-value">{product.sku}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Danh mục:</span>
                  <span className="meta-value">{product.category?.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Trạng thái:</span>
                  <span className="meta-value">{product.inventoryStatus}</span>
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
            {relatedProducts.map((product) => (
              <Col key={product.id} xs={12} sm={12} md={8} lg={6}>
                <CardProduct product={product} />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
