"use client";
import { Row, Col, Typography } from "antd";
import "./FeaturedProducts.css";
import ImgProductA1 from "../../../assets/images/imgProducts/a1.jpg";
import ImgProductA2 from "../../../assets/images/imgProducts/a2.jpeg";
import ImgProductB1 from "../../../assets/images/imgProducts/b1.jpg";
import ImgProductB2 from "../../../assets/images/imgProducts/b2.jpeg";
import ImgProductC1 from "../../../assets/images/imgProducts/c1.jpeg";
import ImgProductC2 from "../../../assets/images/imgProducts/c2.jpeg";
import ImgProductD1 from "../../../assets/images/imgProducts/d1.jpeg";
import ImgProductD2 from "../../../assets/images/imgProducts/d2.jpeg";
import CardComponent from "../../common/CardComponent/CardComponent";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";

const { Title, Text } = Typography;
// Dùng discount thay cho originalPrice
const products = [
    {
      id: 1,
      name: "Áo sơ mi linen cao cấp",
      category: "Áo",
      price: 1290000,
      discount: 20,
      image: ImgProductA1,
      subImage: [ImgProductA2],
      badge: "Sale",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 12 },
        { size: "M", quantity: 5 },
        { size: "L", quantity: 0 },
        { size: "XL", quantity: 5 },
      ],
    },
    {
      id: 2,
      name: "Váy midi silk premium",
      category: "Đầm",
      price: 2490000,
      discount: 0,
      image: ImgProductB1,
      subImage: [ImgProductB2],
      badge: "New",
      isNew: true,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 8 },
        { size: "M", quantity: 2 },
        { size: "L", quantity: 1 },
      ],
    },
    {
      id: 3,
      name: "Blazer wool cao cấp",
      category: "Áo khoác",
      price: 3290000,
      discount: 15,
      image: ImgProductC1,
      subImage: [ImgProductC2],
      badge: "Sale",
      isNew: false,
      status: "Hết hàng",
      sizes: [
        { size: "M", quantity: 0 },
        { size: "L", quantity: 0 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 4,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
  ];

export default function FeaturedProducts() {
  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <Title level={2}>Sản phẩm nổi bật</Title>
          <Text>
            Khám phá những thiết kế được yêu thích nhất từ bộ sưu tập mới nhất
            của chúng tôi
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {products.map((p) => {
            

            return (
              <Col xs={24} sm={12} lg={6} key={p.id}>
                <CardComponent product={p} />
              </Col>
            );
          })}
        </Row>

        <div className="see-more">
          <ButtonComponent size={"large"} textButton={"Xem tất cả sản phẩm"} />
        </div>
      </div>
    </section>
  );
}
