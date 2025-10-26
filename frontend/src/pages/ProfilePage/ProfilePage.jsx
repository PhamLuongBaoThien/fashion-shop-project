"use client";

import { useState } from "react";
import { Avatar, Divider, Tabs, Empty, Spin } from "antd";
import {
  EditOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "./ProfilePage.css";
import { useSelector } from "react-redux";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const ProfilePage = () => {
  const user = useSelector((state) => state.user); // Lấy dữ liệu user từ Redux

  // Mock orders và reviews (sẽ thay bằng API sau)
  const [orders] = useState([
    { id: 1, date: "2024-10-20", total: 1290000, status: "Đã giao" },
    { id: 2, date: "2024-10-15", total: 890000, status: "Đang giao" },
  ]);

  const [reviews] = useState([
    { id: 1, product: "Áo sơ mi linen cao cấp", rating: 5, comment: "Sản phẩm rất tốt, giao hàng nhanh" },
    { id: 2, product: "Quần jean classic", rating: 4, comment: "Chất lượng tốt, fit vừa vặn" },
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
 

  if (!user.id) {
    return (
      <div className="profile-page-loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user.email) {
    return <div>Vui lòng đăng nhập để xem thông tin.</div>;
  }

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

  return (
    <motion.div className="profile-page" variants={containerVariants} initial="hidden" animate="visible">
      {/* Profile Header */}
      <motion.div className="profile-header" variants={itemVariants}>
        <div className="profile-header-content">
          <Avatar size={120} src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="profile-avatar" />
          <div className="profile-info">
            <h1>{user.username || "Chưa cập nhật"}</h1>
            <p className="profile-email">{user.email || "Chưa cập nhật"}</p>
            <p className="profile-meta">Thành viên từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
          </div>
        </div>
        <Link to="/edit-profile">
          <ButtonComponent type="primary" size="large" icon={<EditOutlined />} textButton={"Chỉnh sửa thông tin"} className="profile-edit-btn" disabled={!user.email} />
            
        </Link>
      </motion.div>

      <Divider />

      {/* Personal Information */}
      <motion.div className="profile-section" variants={itemVariants}>
        <h2>Thông tin cá nhân</h2>
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Số điện thoại:</span>
            <span className="detail-value">{user.phone || "Chưa cập nhật"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Địa chỉ:</span>
            <span className="detail-value">{user.address || "Chưa cập nhật"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Giới tính:</span>
            <span className="detail-value">{getGenderLabel(user.gender)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ngày sinh:</span>
            <span className="detail-value">
              {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
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
                  {orders.length > 0 ? (
                    <div className="orders-list">
                      {orders.map((order) => (
                        <div key={order.id} className="order-item">
                          <div className="order-info">
                            <p className="order-id">Đơn hàng #{order.id}</p>
                            <p className="order-date">{new Date(order.date).toLocaleDateString("vi-VN")}</p>
                          </div>
                          <div className="order-status">
                            <span className={`status-badge status-${order.status.toLowerCase().replace(" ", "-")}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="order-total">{order.total.toLocaleString("vi-VN")}đ</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="Chưa có đơn hàng nào" />
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
                              <span className="rating-text">({review.rating}/5)</span>
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