import { Row, Col, Card, Statistic, Table } from "antd"
import { ShoppingOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const AdminDashboard = () => {
  // Mock data
  const stats = [
    {
      title: "Total Products",
      value: 1234,
      icon: <ShoppingOutlined />,
      color: "#1890ff",
    },
    {
      title: "Total Users",
      value: 5678,
      icon: <UserOutlined />,
      color: "#52c41a",
    },
    {
      title: "Total Orders",
      value: 890,
      icon: <ShoppingCartOutlined />,
      color: "#faad14",
    },
    {
      title: "Revenue",
      value: "$45,230",
      icon: <DollarOutlined />,
      color: "#f5222d",
    },
  ]

  const chartData = [
    { month: "Jan", sales: 4000, revenue: 2400 },
    { month: "Feb", sales: 3000, revenue: 1398 },
    { month: "Mar", sales: 2000, revenue: 9800 },
    { month: "Apr", sales: 2780, revenue: 3908 },
    { month: "May", sales: 1890, revenue: 4800 },
    { month: "Jun", sales: 2390, revenue: 3800 },
  ]

  const recentOrders = [
    { id: 1, customer: "John Doe", amount: "$250", status: "Delivered" },
    { id: 2, customer: "Jane Smith", amount: "$180", status: "Shipped" },
    { id: 3, customer: "Bob Johnson", amount: "$320", status: "Pending" },
  ]

  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Status", dataIndex: "status", key: "status" },
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
      <h1 className="dashboard-title">Dashboard Overview</h1>

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
                      <Statistic value={stat.value} />
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
            <Card title="Sales & Revenue" className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#1890ff" />
                  <Line type="monotone" dataKey="revenue" stroke="#52c41a" />
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
            <Card title="Quick Stats" className="quick-stats-card">
              <div className="quick-stat">
                <span>Avg Order Value</span>
                <strong>$285</strong>
              </div>
              <div className="quick-stat">
                <span>Conversion Rate</span>
                <strong>3.2%</strong>
              </div>
              <div className="quick-stat">
                <span>Active Users</span>
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
        <Card title="Recent Orders" style={{ marginTop: 24 }} className="orders-card">
          <Table columns={columns} dataSource={recentOrders} pagination={false} rowKey="id" />
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
