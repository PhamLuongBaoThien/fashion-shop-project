import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  ShoppingOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  InputNumber,
  Empty,
  Space,
  Card,
  Row,
  Col,
  Layout,
  Typography,
  Select,
  Modal,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useMessageApi } from "../../context/MessageContext";
import {
  changeQuantity,
  removeFromCart,
  setCart,
} from "../../redux/slides/cartSlide";
import * as CartService from "../../services/CartService";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./CartPage.css";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Content } = Layout;
const { Title, Text } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function CartPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { product: 'id', size: 'M' }

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useMessageApi(); // Dùng messageApi của context
  //  LẤY DỮ LIỆU TỪ REDUX
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart); // Lấy cả giỏ hàng

  const [sortOrder, setSortOrder] = useState("newest"); // Mặc định là 'mới nhất'

  // 2. SẮP XẾP GIỎ HÀNG BẰNG `useMemo`
  const sortedCartItems = useMemo(() => {
    const itemsCopy = cart.cartItems.slice(); // Tạo bản sao

    switch (sortOrder) {
      case "name_asc":
        // Sắp xếp A-Z
        return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        // Sắp xếp Z-A
        return itemsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
      default:
        // Mới nhất (đảo ngược mảng)
        return itemsCopy.reverse();
    }
  }, [cart.cartItems, sortOrder]); // Chạy lại khi giỏ hàng HOẶC cách sắp xếp thay đổi

  // 3. TÍNH TỔNG TIỀN (Nên dùng useMemo luôn)
  const totalPrice = useMemo(() => {
    return sortedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [sortedCartItems]); // Tính lại khi giỏ hàng đã sắp xếp thay đổi

  const handleQuantityChange = async (productId, size, newQuantity) => {
    // 1. Kiểm tra số lượng hợp lệ
    if (newQuantity < 1) {
      handleRemoveItem(productId, size); // Nếu giảm về 0, hãy xóa
      return;
    }

    if (user?.id) {
      // --- LUỒNG 1: USER ĐÃ ĐĂNG NHẬP (Gọi API) ---
      try {
        // LƯU Ý: Bạn CẦN TẠO API NÀY Ở BACKEND (Phần 5)
        const res = await CartService.updateItemQuantity({
          product: productId,
          size,
          quantity: newQuantity,
        });

        if (res.status === "OK") {
          dispatch(setCart(res.data.items));
        } else {
          showError(res.message);
        }

        // TẠM THỜI: Dùng dispatch để test giao diện
        // console.log("Đã đăng nhập: Gọi API cập nhật số lượng (chưa làm)");
        // dispatch(
        //   changeQuantity({ product: productId, size, quantity: newQuantity })
        // );
      } catch (e) {
        showError(e.response?.data?.message || e.message);
      }
    } else {
      // --- LUỒNG 2: KHÁCH VÃNG LAI (Gọi Redux) ---
      // Tìm item trong giỏ để lấy maxQuantity
      const itemToUpdate = cart.cartItems.find(
        (i) => i.product === productId && i.size === size
      );

      if (!itemToUpdate) return; // Không tìm thấy item

      // 2. Kiểm tra tồn kho (Lấy từ itemToUpdate.maxQuantity)
      if (newQuantity > itemToUpdate.maxQuantity) {
        showError(
          `Số lượng vượt quá tồn kho (Chỉ còn ${itemToUpdate.maxQuantity} sản phẩm).`
        );
        return; // Dừng lại, không cho phép dispatch
      }
      dispatch(
        changeQuantity({ product: productId, size, quantity: newQuantity })
      );
    }
  };

  const confirmRemoveItem = async (productId, size) => {
    if (user?.id) {
      // --- LUỒNG 1: USER ĐÃ ĐĂNG NHẬP (Gọi API) ---
      try {
        const res = await CartService.removeItemFromCart({
          product: productId,
          size: size,
        });
        if (res.status === "OK") {
          dispatch(setCart(res.data.items));
          showSuccess(res.message || "Đã xóa sản phẩm");
        } else {
          showError(res.message);
        }
      } catch (e) {
        showError(e.response?.data?.message || e.message);
      }
    } else {
      // --- LUỒNG 2: KHÁCH VÃNG LAI (Gọi Redux) ---
      dispatch(removeFromCart({ product: productId, size }));
      showSuccess("Đã xóa sản phẩm khỏi giỏ hàng");
    }
  };

  //SỬA HÀM `handleRemoveItem` ĐỂ MỞ MODAL
  const handleRemoveItem = (productId, size) => {
    setItemToDelete({ product: productId, size: size }); // Lưu lại món hàng sắp xóa
    setIsDeleteModalOpen(true); // Mở Modal
  };

  // TẠO HÀM `handleOkDelete` (CHO NÚT "XÓA" TRONG MODAL)
  const handleOkDelete = () => {
    if (itemToDelete) {
      confirmRemoveItem(itemToDelete.product, itemToDelete.size);
    }
    // Đóng modal và reset state
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // TẠO HÀM `handleCancelDelete` (CHO NÚT "HỦY" TRONG MODAL)
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };
  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "40%",
      render: (text, record) => (
        <Link to={`/product/${record.slug}`} className="cart-product-link">
          <Space>
            <img
              src={record.image || "/placeholder.svg"}
              alt={text}
              style={{
                width: "80px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
              >
                {text}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Size: {record.size === "One Size" ? "Free Size" : record.size}
              </Text>
              {record.maxQuantity <= 10 && record.maxQuantity > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "4px 8px",
                    backgroundColor: "#fff2e8",
                    border: "1px solid #ffbb96",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  <Text strong type="danger" style={{ fontSize: "12px" }}>
                    Chỉ còn {record.maxQuantity} sản phẩm!
                  </Text>
                </div>
              )}
            </div>
          </Space>
        </Link>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (price, record) => {
        // Kiểm tra nếu có giảm giá (discount > 0)
        if (record.discount > 0) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Giá gốc gạch ngang */}
              <Text delete style={{ color: "#999", fontSize: "12px" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(record.originalPrice)}
              </Text>
              {/* Giá bán màu đỏ */}
              <Text strong style={{ color: "#ff4d4f" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(price)}
              </Text>
            </div>
          );
        }
        // Nếu không giảm giá -> Hiện bình thường
        return (
          <Text strong >
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)}
          </Text>
        );
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: "15%",
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={() =>
                handleQuantityChange(
                  record.product,
                  record.size,
                  record.quantity - 1
                )
              }
            />
            <InputNumber
              min={1}
              max={record.maxQuantity}
              value={record.quantity}
              onChange={(value) =>
                handleQuantityChange(record.product, record.size, value)
              }
              style={{
                width: "60px",
                textAlign: "center",
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() =>
                handleQuantityChange(
                  record.product,
                  record.size,
                  record.quantity + 1
                )
              }
            />
            
          </Space>
        );
      },
    },
    {
      title: "Tổng cộng",
      key: "total",
      width: "15%",
      render: (_, record) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(record.price * record.quantity)}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.product, record.size)}
        />
      ),
    },
  ];

  return (
    <Content
      style={{
        padding: "10px 24px 40px",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <Title level={2} style={{ color: "#262626", marginBottom: "8px" }}>
              <ShoppingOutlined /> Giỏ hàng của bạn
            </Title>
            <Text type="secondary">
              Bạn có {sortedCartItems.length} sản phẩm trong giỏ hàng{" "}
            </Text>
          </div>

          {/* DROPDOWN SẮP XẾP */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "16px",
            }}
          >
            <Select
              defaultValue="newest"
              style={{ width: 200 }}
              onChange={(value) => setSortOrder(value)} // Cập nhật state khi thay đổi
              options={[
                { value: "newest", label: "Sắp xếp: Mới nhất" },
                { value: "name_asc", label: "Sắp xếp: Tên A-Z" },
                { value: "name_desc", label: "Sắp xếp: Tên Z-A" },
                // Bạn có thể thêm Sắp xếp theo giá ở đây
                // { value: 'price_asc', label: 'Sắp xếp: Giá tăng dần' },
                // { value: 'price_desc', label: 'Sắp xếp: Giá giảm dần' },
              ]}
            />
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {sortedCartItems.length === 0 ? (
                <motion.div variants={itemVariants}>
                  <Card style={{ textAlign: "center", padding: "60px 40px" }}>
                    <Empty
                      description="Giỏ hàng của bạn đang trống"
                      style={{ margin: "20px 0" }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        marginTop: "20px",
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                      }}
                    >
                      <Link
                        to="/products"
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        Tiếp tục mua sắm
                      </Link>
                    </Button>
                  </Card>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Card>
                    <Table
                      columns={cartColumns}
                      dataSource={sortedCartItems}
                      rowKey={(record) => record.product + record.size}
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  </Card>
                </motion.div>
              )}
            </Col>

            <Col xs={24} lg={8}>
              <motion.div
                variants={itemVariants}
                style={{ position: "sticky", top: "100px" }}
              >
                <Card title="Tóm tắt đơn hàng">
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Tiền hàng:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(totalPrice)}
                      </Text>
                    </div>

                    {/* <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Phí vận chuyển:</Text>
                      <Text>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(0)}
                      </Text>
                    </div> */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>Giảm giá:</Text>
                      <Text style={{ color: "#f5222d" }}>
                        -
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(0)}
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
                      <Title
                        level={4}
                        style={{ color: "#fa8c16", marginBottom: 0 }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(totalPrice)}
                      </Title>
                    </div>

                    <ButtonComponent
                      type="primary"
                      block
                      size="large"
                      onClick={handleCheckout}
                      disabled={cart.cartItems.length === 0}
                      textButton={"Tiến hành thanh toán"}
                      style={{
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        height: "48px",
                        fontSize: "16px",
                      }}
                      className={"btn-checkout-primary"}
                    />

                    <Link
                      to="/products"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <ButtonComponent
                        block
                        size="large"
                        style={{
                          height: "48px",
                          fontSize: "16px",
                        }}
                        textButton={"Tiếp tục mua sắm"}
                        className={"btn-continue-shopping"}
                      />
                    </Link>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={isDeleteModalOpen}
        onOk={handleOkDelete}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</p>
      </Modal>
    </Content>
  );
}
