import React, { useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Spin,
  Empty,
  Space,
  Radio,
  DatePicker,
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined, // Icon mới cho đơn chờ
  WarningOutlined, // Icon mới cho hết hàng
  AppstoreOutlined, // Icon cho tổng kho
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  LineChart, // Quay lại dùng LineChart theo yêu cầu
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as DashboardService from "../../services/DashboardService";
import dayjs from "dayjs";

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);

  const [viewType, setViewType] = useState("year"); // 'year' hoặc 'month'
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Mặc định là ngày hiện tại

  // Lấy year và month từ state để truyền vào API
  const queryYear = selectedDate.year();
  const queryMonth = viewType === "month" ? selectedDate.month() + 1 : null; // month() trả về 0-11 nên cần +1

  // --- 1. GỌI API LẤY DỮ LIỆU THẬT ---
  // --- GỌI API ---
  const { data: dashboardData, isLoading } = useQuery({
    // Thêm queryYear và queryMonth vào key để tự động fetch lại khi đổi ngày
    queryKey: ["dashboard-stats", queryYear, queryMonth],
    queryFn: () => DashboardService.getDashboardStats(queryYear, queryMonth),
    enabled: !!user?.access_token,
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Giữ dữ liệu cũ khi đang tải mới để không bị nháy
  });

  const statsData = dashboardData?.data;

  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Custom Tooltip để hiển thị đẹp hơn
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: 5 }}>{label}</p>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{ color: entry.color, marginBottom: 3, fontSize: "13px" }}
            >
              {/* Xử lý hiển thị text tùy theo loại dữ liệu */}
              {entry.name === "Doanh thu"
                ? `${entry.name}: ${formatCurrency(entry.value)}`
                : `${entry.name}: ${entry.value} đơn`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Cấu hình thẻ thống kê (Stats Cards) - Dữ liệu thật
  const stats = [
    {
      title: "Tổng Doanh thu",
      value: statsData?.revenue || 0,
      isCurrency: true,
      icon: <DollarOutlined />,
      color: "#f5222d",
      bg: "#fff1f0", // Thêm màu nền nhạt cho đẹp
    },
    {
      title: "Tổng Đơn hàng",
      value: statsData?.orders || 0,
      icon: <ShoppingCartOutlined />,
      color: "#faad14",
      bg: "#fffbe6",
    },
    {
      title: "Tổng Sản phẩm",
      value: statsData?.products || 0,
      icon: <ShoppingOutlined />,
      color: "#1890ff",
      bg: "#e6f7ff",
    },
    {
      title: "Tổng Khách hàng",
      value: statsData?.users || 0,
      icon: <UserOutlined />,
      color: "#52c41a",
      bg: "#f6ffed",
    },
  ];

  // Cấu hình bảng Đơn hàng gần đây
  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "_id",
      key: "id",
      render: (id) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          #{id?.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "shippingInfo",
      key: "customer",
      render: (info) => info?.fullName || "Khách vãng lai",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "amount",
      render: (text) => (
        <span style={{ color: "#cf1322", fontWeight: 600 }}>
          {formatCurrency(text)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let label = "Chờ xử lý";
        switch (status) {
          case "delivered":
            color = "green";
            label = "Hoàn thành";
            break;
          case "shipped":
            color = "blue";
            label = "Đang giao";
            break;
          case "cancelled":
            color = "red";
            label = "Đã hủy";
            break;
          case "confirmed":
            color = "geekblue";
            label = "Đã xác nhận";
            break;
          default:
            color = "orange";
            label = "Chờ xử lý";
        }
        return <Tag color={color}>{label.toUpperCase()}</Tag>;
      },
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          className="dashboard-title"
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: "bold",
            color: "#1f1f1f",
          }}
        >
          Tổng quan (Dashboard)
        </h1>
        <Space>
          <Radio.Group
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="year">Theo Năm</Radio.Button>
            <Radio.Button value="month">Theo Tháng</Radio.Button>
          </Radio.Group>

          <DatePicker
            picker={viewType === "year" ? "year" : "month"}
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
            format={viewType === "year" ? "YYYY" : "MM/YYYY"}
          />
        </Space>
      </div>

      {/* 1. Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={[16, 16]} className="stats-row">
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div variants={itemVariants}>
                <Card
                  className="stat-card"
                  bordered={false}
                  style={{
                    borderLeft: `4px solid ${stat.color}`,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="stat-content"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="stat-info">
                      <p
                        className="stat-title"
                        style={{
                          color: "#8c8c8c",
                          marginBottom: 4,
                          fontSize: 13,
                          textTransform: "uppercase",
                        }}
                      >
                        {stat.title}
                      </p>
                      <Statistic
                        value={stat.value}
                        formatter={(val) =>
                          stat.isCurrency ? formatCurrency(val) : val
                        }
                        valueStyle={{
                          fontWeight: "bold",
                          fontSize: 24,
                          color: "#262626",
                        }}
                      />
                    </div>
                    <div
                      className="stat-icon"
                      style={{
                        color: stat.color,
                        fontSize: 24,
                        backgroundColor: stat.bg,
                        padding: 12,
                        borderRadius: "50%",
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* 2. Biểu đồ & Thống kê nhanh */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Biểu đồ Doanh thu & Số đơn hàng */}
        <Col xs={24} lg={19}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card
              title={`Biểu đồ Doanh thu - ${
                viewType === "year"
                  ? `Năm ${queryYear}`
                  : `Tháng ${queryMonth}/${queryYear}`
              }`}
              className="chart-card"
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={statsData?.chartData || []}
                    margin={{ top: 20, right: 10, bottom: 30, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    {/* XAxis tự động hiển thị "Thg X" hoặc "Ngày X" do backend đã format */}
                    <XAxis
                      dataKey="name"
                      padding={{ left: 20, right: 20 }}
                      tick={{ fill: "#8c8c8c", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      // Nếu xem theo tháng (nhiều ngày) thì chỉ hiện các mốc quan trọng để đỡ rối nếu muốn
                      interval={viewType === "month" ? 0 : 0}
                      angle={-45}
                      textAnchor="end"
                    />

                    {/* Trục trái: Doanh thu (Màu xanh lá) */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${val / 1000000}M` : val
                      }
                      stroke="#52c41a"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8c8c8c" }}
                      label={{
                        value: "Doanh thu (VNĐ)",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                        style: {
                          textAnchor: "middle",
                          fill: "#52c41a",
                          fontSize: 12,
                        },
                      }}
                    />

                    {/* Trục phải: Số đơn hàng (Màu xanh dương) */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#1890ff"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8c8c8c" }}
                      label={{
                        value: "Số đơn hàng (Đã thanh toán)",
                        angle: 90,
                        position: "insideRight",
                        offset: 0,
                        style: {
                          textAnchor: "middle",
                          fill: "#1890ff",
                          fontSize: 12,
                        },
                      }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />

                    {/* Line Số đơn hàng (Trục phải) */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sales"
                      name="Số đơn hàng (Đã thanh toán)"
                      stroke="#1890ff"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#1890ff",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6 }}
                    />

                    {/* Line Doanh thu (Trục trái) */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#52c41a"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#52c41a",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Thống kê nhanh */}
        <Col xs={24} lg={5}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card
              title="Cần xử lý ngay"
              className="quick-stats-card"
              bordered={false}
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* ĐƠN HÀNG CHỜ XỬ LÝ */}
              <div
                className="quick-stat"
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                    Đơn hàng chờ xử lý
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      marginTop: 4,
                      color: "#faad14",
                    }}
                  >
                    {statsData?.pendingOrders || 0} đơn
                  </div>
                </div>
              </div>

              {/* SẢN PHẨM HẾT HÀNG */}
              <div
                className="quick-stat"
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                    Sản phẩm hết hàng
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      marginTop: 4,
                      color: "#ff4d4f",
                    }}
                  >
                    {statsData?.outOfStock || 0} SP
                  </div>
                </div>
              </div>

              {/* TỔNG KHO */}
              <div
                className="quick-stat"
                style={{
                  padding: "20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                    Tổng sản phẩm trong kho
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      marginTop: 4,
                      color: "#262626",
                    }}
                  >
                    {statsData?.products || 0} SP
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* 3. Đơn hàng gần đây */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card
          title="Giao dịch gần đây"
          style={{
            marginTop: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bordered={false}
        >
          {statsData?.recentOrders?.length > 0 ? (
            <Table
              columns={columns}
              dataSource={statsData.recentOrders}
              pagination={false}
              rowKey="_id"
              scroll={{ x: true }}
              size="middle"
            />
          ) : (
            <Empty
              description="Chưa có đơn hàng nào"
              style={{ margin: "30px 0" }}
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
