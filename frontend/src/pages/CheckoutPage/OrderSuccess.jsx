import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Card, Layout, Typography, Space, Result, Spin, Button } from "antd";
import * as PaymentService from "../../services/PaymentService";
import * as OrderService from "../../services/OrderService"; // Cần import để tạo đơn thật
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../redux/slides/cartSlide";
import { useMessageApi } from "../../context/MessageContext";

const { Content } = Layout;
const { Title, Text } = Typography;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function OrderSuccess({ order }) {
  const user = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useMessageApi();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(order || null); // Đơn hàng hiển thị

  // Check callback VNPay
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_TxnRef = searchParams.get("vnp_TxnRef"); // Đây là tempOrderId
  const isVnpayCallback = !!vnp_ResponseCode;

  useEffect(() => {
    const processPayment = async () => {
      if (isVnpayCallback) {
        setIsLoading(true);
        try {
          if (vnp_ResponseCode === "00") {
            // --- THANH TOÁN THÀNH CÔNG ---

            // 2. Tìm đơn hàng tạm
            const tempKey = `vnpay_temp_order_${vnp_TxnRef}`;
            const tempData = localStorage.getItem(tempKey);

            if (tempData) {
              const parsedData = JSON.parse(tempData);

              // Bổ sung thông tin đã thanh toán
              parsedData.isPaid = true;
              parsedData.paidAt = new Date();
              parsedData.paymentMethod = "vnpay";
              delete parsedData.tempOrderId; // Xóa ID tạm đi

              // 3. TẠO ĐƠN HÀNG THẬT
              console.log("Creating real order from temp data...");
              const res = await OrderService.createOrder(parsedData);

              if (res.status === "OK") {
                setIsSuccess(true);
                setCreatedOrder(res.data);
                // Xóa temp data và clear giỏ hàng
                localStorage.removeItem(tempKey);
                dispatch(clearCart());
                showSuccess("Thanh toán thành công!");
              } else {
                showError("Lỗi tạo đơn hàng!");
              }
            } else {
              // Trường hợp F5 lại trang (mất localStorage hoặc đã xử lý rồi)
              // Nếu Backend đã lưu rồi thì coi như thành công
              setIsSuccess(true);
            }
          } else {
            setIsSuccess(false);
            showError("Giao dịch thất bại!");
          }
        } catch (error) {
          console.error(error);
          setIsSuccess(false);
          showError("Lỗi xử lý kết quả thanh toán!");
        } finally {
          setIsLoading(false);
        }
      } else if (order) {
        // Trường hợp COD (đã có order từ props truyền vào)
        setIsSuccess(true);
        setCreatedOrder(order);
      }
    };

    // Chỉ chạy logic này nếu chưa xử lý xong
    if (!isSuccess && (isVnpayCallback || order)) {
      processPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  if (isLoading) {
    return (
      <Content
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Đang xử lý đơn hàng..." />
      </Content>
    );
  }

  const displayId = createdOrder?._id || vnp_TxnRef || "MỚI";

  return (
    <Content
      style={{
        padding: "100px 24px",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Card
            style={{
              textAlign: "center",
              padding: "60px 40px",
              borderRadius: "12px",
            }}
          >
            {isSuccess ? (
              <>
                <motion.div
                  animate={{ scale: [0.8, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  style={{ marginBottom: "24px" }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: "80px", color: "#52c41a" }}
                  />
                </motion.div>
                <Title
                  level={2}
                  style={{ color: "#262626", marginBottom: "16px" }}
                >
                  {isVnpayCallback
                    ? "Thanh toán thành công!"
                    : "Đặt hàng thành công!"}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Mã đơn hàng:{" "}
                  <strong>#{displayId.slice(-6).toUpperCase()}</strong>
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: "16px", lineHeight: "1.6" }}
                >
                  Cảm ơn bạn đã mua hàng. Đơn hàng đã được ghi nhận vào hệ
                  thống.
                </Text>
                <div style={{ marginTop: "40px" }}>
                  <Space>
                    <Link to="/products">
                      <ButtonComponent
                        type="primary"
                        size="large"
                        style={{
                          backgroundColor: "#fa8c16",
                          borderColor: "#fa8c16",
                          height: "48px",
                        }}
                        textButton={"Tiếp tục mua sắm"}
                      />
                    </Link>
                    {user?.id && (
                    <Link to={`/my-order-details/${createdOrder?._id}`}>
                      <Button
                        size="large"
                        style={{ height: "48px" }}
                        disabled={!createdOrder?._id}
                      >
                        Xem chi tiết đơn hàng
                      </Button>
                    </Link>
                    )}
                  </Space>
                </div>
              </>
            ) : (
              // Thất bại
              <>
                <motion.div style={{ marginBottom: "24px" }}>
                  <CloseCircleOutlined
                    style={{ fontSize: "80px", color: "#ff4d4f" }}
                  />
                </motion.div>
                <Title
                  level={2}
                  style={{ color: "#ff4d4f", marginBottom: "16px" }}
                >
                  Thanh toán thất bại!
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: "16px", lineHeight: "1.6" }}
                >
                  Giao dịch đã bị hủy hoặc xảy ra lỗi.
                  <br />
                  Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </Text>
                <div style={{ marginTop: "40px" }}>
                  <Space>
                    <Link to="/checkout">
                      <ButtonComponent
                        type="primary"
                        size="large"
                        style={{ height: "48px" }}
                        textButton={"Thử lại"}
                      />
                    </Link>
                  </Space>
                </div>
              </>
            )}
          </Card>
        </div>
      </motion.div>
    </Content>
  );
}
