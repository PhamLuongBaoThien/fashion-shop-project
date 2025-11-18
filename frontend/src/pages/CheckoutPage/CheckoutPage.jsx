import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Row, Col, Card, Layout, Typography, Steps, Form } from "antd";

import { useSelector, useDispatch } from "react-redux";
import { useMessageApi } from "../../context/MessageContext";
import { clearCart } from "../../redux/slides/cartSlide";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/ExternalApiService";
import * as OrderService from "../../services/OrderService"; // (Frontend service)

import { useMutationHooks } from "../../hooks/useMutationHook";

// Import các component con
import OrderSuccess from "./OrderSuccess";
import OrderSummary from "./OrderSummary";
import Step1_ShippingForm from "./Step1_ShippingForm";
import Step2_PaymentForm from "./Step2_PaymentForm";

const { Content } = Layout;
const { Title } = Typography;

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

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showError, showSuccess } = useMessageApi();
  const dispatch = useDispatch();

  // --- TOÀN BỘ STATE ĐƯỢC GIỮ NGUYÊN TẠI ĐÂY ---
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Đặt 'cod' làm mặc định
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [step0Values, setStep0Values] = useState(null);

  // State địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State loading địa chỉ
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  // KHỞI TẠO MUTATION ĐẶT HÀNG ---
  const mutation = useMutationHooks((data) => OrderService.createOrder(data));
  // Lấy trạng thái loading từ hook
  const { isPending: isProcessing } = mutation;

  // --- LẤY DỮ LIỆU TỪ REDUX ---
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);

  // --- LOGIC TÍNH TOÁN VẪN Ở ĐÂY ---
  const shippingCosts = {
    standard: 30000,
    express: 60000,
    overnight: 100000,
  };

  const itemsPrice = useMemo(() => {
    return cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cart.cartItems]);

  const finalTotal = itemsPrice + shippingCosts[shippingMethod];

  // --- TOÀN BỘ LOGIC (useEffect, Handlers) VẪN Ở ĐÂY ---

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Tải Tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsProvincesLoading(true);
      try {
        const provinceData = await getProvinces();
        setProvinces(provinceData);
      } catch (error) {
        showError("Lỗi khi tải danh sách tỉnh thành!");
      } finally {
        setIsProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, [showError]);

  // Hook điền thông tin cơ bản
  useEffect(() => {
    if (user?.id) {
      form.setFieldsValue({
        customerInfo: {
          fullName: user.username,
          email: user.email,
          phone: user.phone,
        },
        shippingInfo: {
          fullName: user.username,
          phone: user.phone,
          detailAddress: user.address?.detailAddress,
        },
      });
    } else {
      form.resetFields();
      setDistricts([]);
      setWards([]);
    }
  }, [user, form]);

  // Hook xử lý Tỉnh (chuỗi)
  useEffect(() => {
    if (user?.address?.province && provinces.length > 0) {
      const savedProvince = provinces.find(
        (p) => p.label === user.address.province
      );
      if (savedProvince) {
        form.setFieldsValue({
          shippingInfo: { province: savedProvince.value },
        });
        handleProvinceChange(savedProvince.value);
      }
    }
  }, [user?.address?.province, provinces, form]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hook xử lý Huyện (chuỗi)
  useEffect(() => {
    if (user?.address?.district && districts.length > 0) {
      const savedDistrict = districts.find(
        (d) => d.label === user.address.district
      );
      if (savedDistrict) {
        form.setFieldsValue({
          shippingInfo: { district: savedDistrict.value },
        });
        handleDistrictChange(savedDistrict.value);
      }
    }
  }, [user?.address?.district, districts, form]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hook xử lý Xã (chuỗi)
  useEffect(() => {
    if (user?.address?.ward && wards.length > 0) {
      const savedWard = wards.find((w) => w.label === user.address.ward);
      if (savedWard) {
        form.setFieldsValue({
          shippingInfo: { ward: savedWard.value },
        });
      }
    }
  }, [user?.address?.ward, wards, form]);

  // Chuyển hướng nếu giỏ hàng trống
  useEffect(() => {
    if (cart.cartItems.length === 0 && !orderPlaced) {
      showError("Giỏ hàng của bạn đang trống!");
      navigate("/products");
    }
  }, [cart.cartItems, orderPlaced, navigate, showError]);

  // Các hàm xử lý địa chỉ
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) return;
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({
      shippingInfo: { district: undefined, ward: undefined },
    });
    setIsDistrictsLoading(true);
    try {
      const districtData = await getDistricts(provinceCode);
      setDistricts(districtData);
    } catch (error) {
      showError("Lỗi khi tải danh sách quận huyện!");
    } finally {
      setIsDistrictsLoading(false);
    }
  };

  const handleDistrictChange = async (districtCode) => {
    if (!districtCode) return;
    setWards([]);
    form.setFieldsValue({
      shippingInfo: { ward: undefined },
    });
    setIsWardsLoading(true);
    try {
      const wardData = await getWards(districtCode);
      setWards(wardData);
    } catch (error) {
      showError("Lỗi khi tải danh sách phường xã!");
    } finally {
      setIsWardsLoading(false);
    }
  };

  // Hàm xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (!step0Values) {
      showError("Lỗi: Thiếu thông tin giao hàng! Vui lòng quay lại.");
      setCurrentStep(0);
      return;
    }
    if (!paymentMethod) {
      showError("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const customer = step0Values.customerInfo;
    const address = step0Values.shippingInfo;

    //Dịch Tên địa chỉ
    const provinceName = provinces.find(
      (p) => p.value === address.province
    )?.label;
    const districtName = districts.find(
      (d) => d.value === address.district
    )?.label;
    const wardName = wards.find((w) => w.value === address.ward)?.label;

    let shippingInfo = {};
    if (isDifferentAddress) {
      shippingInfo = {
        fullName: address.fullName,
        phone: address.phone,
        province: provinceName,
        district: districtName,
        ward: wardName,
        detailAddress: address.detailAddress,
      };
    } else {
      shippingInfo = {
        fullName: customer.fullName,
        phone: customer.phone,
        province: provinceName,
        district: districtName,
        ward: wardName,
        detailAddress: address.detailAddress,
      };
    }

    const orderData = {
      orderItems: cart.cartItems,
      totalPrice: finalTotal,
      itemsPrice: itemsPrice,
      shippingPrice: shippingCosts[shippingMethod],
      paymentMethod: paymentMethod,
      userId: user?.id || null,
      customerInfo: customer,
      shippingInfo: shippingInfo,
    };

    console.log("Dữ liệu gửi đi (Phần 9):", orderData);
    mutation.mutate(orderData, {
      onSuccess: (data) => {
        showSuccess(data.message || "Đặt hàng thành công!");
        setCurrentStep(2);
        setOrderPlaced(true);
        dispatch(clearCart());
      },
      onError: (error) => {
        // Lỗi từ backend (ví dụ "Hết hàng") sẽ hiển thị ở đây
        showError(error.message || "Lỗi khi đặt hàng!");
      },
    });
  };

  // --- RENDER ---

  if (orderPlaced) {
    return <OrderSuccess />;
  }

  return (
    <Content
      style={{
        padding: "100px 24px 40px",
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
          <Link
            to="/cart"
            style={{
              color: "#fa8c16",
              textDecoration: "none",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeftOutlined /> Quay lại giỏ hàng
          </Link>

          <Title level={2} style={{ color: "#262626", marginBottom: "32px" }}>
            Thanh toán
          </Title>

          <Row gutter={[24, 24]}>
            {/* --- CỘT BÊN TRÁI (FORM) --- */}
            <Col xs={24} lg={16}>
              <motion.div variants={itemVariants}>
                <Card>
                  <Steps
                    current={currentStep}
                    items={[
                      {
                        title: "Thông tin giao hàng",
                        icon: <EnvironmentOutlined />,
                      },
                      {
                        title: "Xác nhận thanh toán",
                        icon: <CreditCardOutlined />,
                      },
                      { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
                    ]}
                    style={{ marginBottom: "32px" }}
                  />

                  {/* Render Form Bước 0 */}
                  {currentStep === 0 && (
                    // eslint-disable-next-line react/jsx-pascal-case
                    <Step1_ShippingForm
                      form={form}
                      onFinishStep1={(values) => {
                        setStep0Values(values);
                        setCurrentStep(1);
                      }}
                      isDifferentAddress={isDifferentAddress}
                      setIsDifferentAddress={setIsDifferentAddress}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      provinces={provinces}
                      districts={districts}
                      wards={wards}
                      isProvincesLoading={isProvincesLoading}
                      isDistrictsLoading={isDistrictsLoading}
                      isWardsLoading={isWardsLoading}
                      handleProvinceChange={handleProvinceChange}
                      handleDistrictChange={handleDistrictChange}
                      shippingMethod={shippingMethod}
                      setShippingMethod={setShippingMethod}
                    />
                  )}

                  {/* Render Form Bước 1 */}
                  {currentStep === 1 && (
                    // eslint-disable-next-line react/jsx-pascal-case
                    <Step2_PaymentForm
                      onPlaceOrder={handlePlaceOrder}
                      onBack={() => setCurrentStep(0)}
                      isProcessing={isProcessing}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      isDifferentAddress={isDifferentAddress}
                    />
                  )}
                </Card>
              </motion.div>
            </Col>

            {/* --- CỘT BÊN PHẢI (TÓM TẮT) --- */}
            <Col xs={24} lg={8}>
              <OrderSummary
                cartItems={cart.cartItems}
                itemsPrice={itemsPrice}
                shippingCost={shippingCosts[shippingMethod]}
                finalTotal={finalTotal}
              />
            </Col>
          </Row>
        </div>
      </motion.div>
    </Content>
  );
}
