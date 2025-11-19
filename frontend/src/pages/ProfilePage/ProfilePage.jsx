import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Divider, Tabs, Empty, Spin, Tag, Button } from "antd";
import {
  EditOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "./ProfilePage.css";
import { useSelector } from "react-redux";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import { useMessageApi } from "../../context/MessageContext";
import * as OrderService from "../../services/OrderService";

const ProfilePage = () => {
  const user = useSelector((state) => state.user); // Lấy dữ liệu user từ Redux
  const navigate = useNavigate();

  // Sử dụng optional chaining để tránh lỗi nếu context chưa sẵn sàng
  const messageApi = useMessageApi();

  // --- STATE CHO ĐƠN HÀNG ---
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    // Nếu user.id đã tồn tại (nghĩa là đã đăng nhập)
    if (!user.id) {
      navigate("/sign-in"); // Chuyển hướng về trang chủ
    }
  }, [user.id, navigate]); // Chạy lại khi user.id hoặc navigate thay đổi

  // Mock orders và reviews (sẽ thay bằng API sau)

  const [reviews] = useState([
    {
      id: 1,
      product: "Áo sơ mi linen cao cấp",
      rating: 5,
      comment: "Sản phẩm rất tốt, giao hàng nhanh",
    },
    {
      id: 2,
      product: "Quần jean classic",
      rating: 4,
      comment: "Chất lượng tốt, fit vừa vặn",
    },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Lấy thông tin user khi tải trang

  // 1. KIỂM TRA ĐĂNG NHẬP
  useEffect(() => {
    if (!user?.id) {
      navigate("/sign-in");
    }
  }, [user?.id, navigate]);

  // 2. GỌI API LẤY DANH SÁCH ĐƠN HÀNG
  useEffect(() => {
    if (user?.id) {
      const fetchMyOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const res = await OrderService.getMyOrders();
          if (res?.status === "OK") {
            const sortedOrders = (res.data || []).sort((a, b) => {
              // Lấy ngày tạo, nếu không có thì dùng ngày hiện tại để tránh lỗi
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              // Sắp xếp giảm dần (mới nhất - b - lên trước)
              return dateB - dateA;
            });
            // Sắp xếp đơn mới nhất lên đầu
            setOrders(sortedOrders);
          } else {
            setOrders([]);
          }
        } catch (error) {
          console.error("Lỗi lấy đơn hàng:", error);
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      };

      fetchMyOrders();
    }
  }, [user?.id]);

  const getGenderLabel = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  // Helper render trạng thái đơn hàng
  const renderOrderStatus = (order) => {
    if (order.isDelivered) {
      return <Tag color="green">Đã giao hàng</Tag>;
    } else if (order.isPaid) {
      return <Tag color="blue">Đã thanh toán / Chờ giao</Tag>;
    } else {
      return <Tag color="orange">Đang xử lý</Tag>;
    }
  };

  if (!user?.id) {
    return (
      <div
        className="profile-page-loading"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      className="profile-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <motion.div className="profile-header" variants={itemVariants}>
        <div className="profile-header-content">
          <Avatar
            size={120}
            src={
              user.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1>{user.username || "Chưa cập nhật"}</h1>
            <p className="profile-email">{user.email || "Chưa cập nhật"}</p>
            <p className="profile-meta">
              Thành viên từ{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "Chưa cập nhật"}
            </p>
          </div>
        </div>
        <Link to="/edit-profile">
          <ButtonComponent
            type="primary"
            size="large"
            icon={<EditOutlined />}
            textButton={"Chỉnh sửa thông tin"}
            className="profile-edit-btn"
            disabled={!user.email}
          />
        </Link>
      </motion.div>

      <Divider />

      {/* Personal Information */}
      <motion.div className="profile-section" variants={itemVariants}>
        <h2>Thông tin cá nhân</h2>
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Số điện thoại:</span>
            <span className="detail-value">
              {user.phone || "Chưa cập nhật"}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Địa chỉ:</span>
            <span className="detail-value">
              {
                // Ghép các phần địa chỉ lại, lọc ra các phần rỗng và nối chúng bằng dấu phẩy
                [
                  user.address?.detailAddress,
                  user.address?.ward,
                  user.address?.district,
                  user.address?.province,
                ]
                  .filter(Boolean) // Lọc bỏ các giá trị null, undefined hoặc chuỗi rỗng
                  .join(", ") || "Chưa cập nhật"
              }
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Giới tính:</span>
            <span className="detail-value">{getGenderLabel(user.gender)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ngày sinh:</span>
            <span className="detail-value">
              {user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                : "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </motion.div>

      <Divider />

      {/* Tabs Section */}
      <motion.div className="profile-tabs" variants={itemVariants}>
        <Tabs
          items={[
            {
              key: "orders",
              label: (
                <span>
                  <ShoppingOutlined /> Đơn hàng ({orders.length})
                </span>
              ),
              children: (
                <div className="tab-content">
                  {isLoadingOrders ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin tip="Đang tải đơn hàng..." />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="orders-list">
                      {orders.map((order) => (
                        <div key={order._id} className="order-item">
                          <div className="order-info">
                            <p className="order-id">
                              Đơn hàng #
                              {order._id
                                ? order._id.slice(-6).toUpperCase()
                                : "NA"}
                            </p>
                            <p className="order-date">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : ""}
                            </p>
                            <p
                              style={{
                                fontSize: "13px",
                                color: "#888",
                                marginTop: "4px",
                              }}
                            >
                              {order.orderItems && order.orderItems[0]?.name}
                              {order.orderItems && order.orderItems.length > 1
                                ? ` và ${
                                    order.orderItems.length - 1
                                  } sản phẩm khác`
                                : ""}
                            </p>
                          </div>

                          <div className="order-status">
                            {renderOrderStatus(order)}
                          </div>

                          <div
                            className="order-total"
                            style={{ textAlign: "right" }}
                          >
                            <div style={{ fontWeight: "bold" }}>
                              {order.totalPrice
                                ? order.totalPrice.toLocaleString("vi-VN")
                                : 0}
                              đ
                            </div>
                            <Link to={`/my-order-details/${order._id}`}>
                              <Button
                                type="link"
                                size="small"
                                icon={<EyeOutlined />}
                              >
                                Chi tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="Bạn chưa có đơn hàng nào" />
                  )}
                </div>
              ),
            },
            {
              key: "reviews",
              label: (
                <span>
                  <StarOutlined /> Đánh giá ({reviews.length})
                </span>
              ),
              children: (
                <div className="tab-content">
                  {reviews.length > 0 ? (
                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <p className="review-product">{review.product}</p>
                            <div className="review-rating">
                              {"⭐".repeat(review.rating)}
                              <span className="rating-text">
                                ({review.rating}/5)
                              </span>
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="Chưa có đánh giá nào" />
                  )}
                </div>
              ),
            },
            {
              key: "wishlist",
              label: (
                <span>
                  <HeartOutlined /> Yêu thích
                </span>
              ),
              children: (
                <div className="tab-content">
                  <Empty description="Danh sách yêu thích trống" />
                </div>
              ),
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
