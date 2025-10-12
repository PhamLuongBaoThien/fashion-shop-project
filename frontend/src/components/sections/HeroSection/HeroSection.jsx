"use client"
import { Button, Row, Col, Typography, Space } from "antd"
import { ArrowRightOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import "./HeroSection.css"

const { Title, Paragraph } = Typography

export default function HeroSection({imgHeroSection}) {
    const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <div>
              <Title level={1} className="hero-title">
                Phong cách tối giản
                <br />
                <span style={{ color: "#fa8c16" }}>meets</span> thiết kế tinh tế
              </Title>

              <Paragraph className="hero-paragraph">
                Khám phá bộ sưu tập thời trang cao cấp với những thiết kế độc đáo, chất liệu premium và phong cách hiện
                đại.
              </Paragraph>

              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Space size="middle" wrap>
                  <Button type="dashed" size="large" className="btn-primary-custom" onClick={() => navigate("/products")}>
                    Khám phá bộ sưu tập
                    <ArrowRightOutlined style={{ marginLeft: "8px" }} />
                  </Button>

                  <Button size="large" className="btn-secondary-custom">
                    Xem lookbook
                  </Button>
                </Space>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Hero Image */}
      <div
        className="hero-image"
        style={{ backgroundImage: `url(${imgHeroSection})` }}
      />
    </section>
  )
}
