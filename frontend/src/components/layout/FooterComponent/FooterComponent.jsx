import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Input, Row, Col, Typography, Space, Divider } from "antd";
import "./FooterComponent.css";

const { Title, Text, Link } = Typography;

export default function FooterComponent() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} md={12} lg={6}>
            <Title level={2} className="brand-title">
              D.E
            </Title>
            <Text className="brand-desc">
              Thương hiệu thời trang cao cấp mang đến những sản phẩm chất lượng
              với thiết kế tinh tế và phong cách hiện đại.
            </Text>

            <Space direction="vertical" size="small">
              <div className="contact-info">
                <EnvironmentOutlined style={{ color: "#bfbfbf" }} />
                <Text style={{ color: "#bfbfbf" }}>
                  Thới Bình, Ninh Kiều, Cần Thơ
                </Text>
              </div>
              <div className="contact-info">
                <PhoneOutlined style={{ color: "#bfbfbf" }} />
                <Text style={{ color: "#bfbfbf" }}>+84 123 456 789</Text>
              </div>
              <div className="contact-info">
                <MailOutlined style={{ color: "#bfbfbf" }} />
                <Text style={{ color: "#bfbfbf" }}>hello@de.vn</Text>
              </div>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} className="section-title">
              Liên kết nhanh
            </Title>
            <Space direction="vertical" size="middle">
              <Link href="/about" className="quick-link">
                Giới thiệu
              </Link>
              <Link href="/products" className="quick-link">
                Sản phẩm
              </Link>
              <Link href="/collections" className="quick-link">
                Bộ sưu tập
              </Link>
              <Link href="/news" className="quick-link">
                Tin tức
              </Link>
              <Link href="/contact" className="quick-link">
                Liên hệ
              </Link>
              <Link href="/stores" className="quick-link">
                Hệ thống cửa hàng
              </Link>
            </Space>
          </Col>

          {/* Customer Support */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} className="section-title">
              Hỗ trợ khách hàng
            </Title>
            <Space direction="vertical" size="middle">
              <Link href="/shipping" className="quick-link">
                Chính sách giao hàng
              </Link>
              <Link href="/returns" className="quick-link">
                Đổi trả & Hoàn tiền
              </Link>
              <Link href="/size-guide" className="quick-link">
                Hướng dẫn chọn size
              </Link>
              <Link href="/care" className="quick-link">
                Bảo quản sản phẩm
              </Link>
              <Link href="/privacy" className="quick-link">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="quick-link">
                Điều khoản sử dụng
              </Link>
            </Space>
          </Col>

          {/* Newsletter */}
          <Col xs={24} md={12} lg={6}>
            <Title level={4} className="section-title">
              Đăng ký nhận tin
            </Title>
            <Text className="newsletter-text">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </Text>

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="newsletter-input"
                />
                <Button type="primary" className="newsletter-button">
                  Đăng ký
                </Button>
              </Space.Compact>

              <Space size="middle" style={{ paddingTop: "16px" }}>
                <div className="social-icon">
                  <FacebookOutlined
                    style={{ fontSize: "18px", color: "#ffffff" }}
                  />
                </div>
                <div className="social-icon">
                  <InstagramOutlined
                    style={{ fontSize: "18px", color: "#ffffff" }}
                  />
                </div>
                <div className="social-icon">
                  <YoutubeOutlined
                    style={{ fontSize: "18px", color: "#ffffff" }}
                  />
                </div>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <Divider className="bottom-bar" />
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text className="bottom-text">
              © 2025 D.E. Tất cả quyền được bảo lưu.
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space size="large">
              <Link href="/privacy" className="bottom-link">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="bottom-link">
                Điều khoản
              </Link>
              <Link href="/sitemap" className="bottom-link">
                Sơ đồ trang
              </Link>
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
}
