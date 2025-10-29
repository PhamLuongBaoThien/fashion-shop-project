import { Row, Col, Card, Statistic, Table } from "antd"
import { ShoppingOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const AdminDashboard = () => {
  // HÀM HỖ TRỢ ĐỊNH DẠNG TIỀN TỆ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };


  const stats = [
    {
      title: "Tổng Sản phẩm",
      value: 1234,
      icon: <ShoppingOutlined />,
      color: "#1890ff",
    },
    {
      title: "Tổng Người dùng",
      value: 5678,
      icon: <UserOutlined />,
      color: "#52c41a",
    },
    {
      title: "Tổng Đơn hàng",
      value: 890,
      icon: <ShoppingCartOutlined />,
      color: "#faad14",
    },
    {
      title: "Doanh thu",
      value: 45230000, // Chuyển sang dạng số
      isCurrency: true, // Thêm cờ để biết cần định dạng
      icon: <DollarOutlined />,
      color: "#f5222d",
    },
  ]

  const chartData = [
    { month: "Thg 1", sales: 4000, revenue: 2400 },
    { month: "Thg 2", sales: 3000, revenue: 1398 },
    { month: "Thg 3", sales: 2000, revenue: 9800 },
    { month: "Thg 4", sales: 2780, revenue: 3908 },
    { month: "Thg 5", sales: 1890, revenue: 4800 },
    { month: "Thg 6", sales: 2390, revenue: 3800 },
  ]

  const recentOrders = [
    { id: 1, customer: "Nguyễn Văn A", amount: 250000, status: "Đã giao" },
    { id: 2, customer: "Trần Thị B", amount: 180000, status: "Đang giao" },
    { id: 3, customer: "Lê Văn C", amount: 320000, status: "Chờ xử lý" },
  ]

  const columns = [
    { title: "Mã Đơn hàng", dataIndex: "id", key: "id" },
    { title: "Khách hàng", dataIndex: "customer", key: "customer" },
    { 
      title: "Tổng tiền", 
      dataIndex: "amount", 
      key: "amount",
      render: (text) => formatCurrency(text) // Định dạng tiền tệ
    },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Tổng quan (Dashboard)</h1>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Row gutter={[16, 16]} className="stats-row">
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div variants={itemVariants}>
                <Card className="stat-card" style={{ borderLeftColor: stat.color }}>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div className="stat-info">
                      <p className="stat-title">{stat.title}</p>
                      <Statistic value={stat.isCurrency ? formatCurrency(stat.value) : stat.value} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card title="Bán hàng & Doanh thu" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Bán hàng" stroke="#1890ff" />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#52c41a" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card title="Thống kê nhanh" className="quick-stats-card">
              <div className="quick-stat">
                <span>Giá trị Đơn hàng TB</span>
                <strong>{formatCurrency(285000)}</strong>
              </div>
              <div className="quick-stat">
                <span>Tỷ lệ chuyển đổi</span>
                <strong>3.2%</strong>
              </div>
              <div className="quick-stat">
                <span>Người dùng hoạt động</span>
                <strong>1,234</strong>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card title="Đơn hàng gần đây" style={{ marginTop: 24 }} className="orders-card">
          <Table columns={columns} dataSource={recentOrders} pagination={false} rowKey="id" />
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminDashboard