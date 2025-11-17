"use client";
import { Typography } from "antd";
import { Link } from "react-router-dom";
import "./FeaturedProducts.css";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import CardComponent from "../../common/CardComponent/CardComponent";
import ButtonComponent from "../../common/ButtonComponent/ButtonComponent";

const { Title, Text } = Typography;
// Dùng discount thay cho originalPrice

export default function FeaturedProducts({ products, textButton }) {
  const settings = {
    dots: false,
    infinite: false, // Vòng lặp sẽ tốt hơn nếu bạn có nhiều hơn 4 sản phẩm
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024, // Dưới 1024px
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768, // Dưới 768px
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480, // Dưới 480px
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

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

        {/* 3. SỬ DỤNG SLIDER */}
        <Slider {...settings}>
          {products.map((p) => (
            // Sử dụng _id từ MongoDB làm key
            <div key={p._id}>
              <CardComponent product={p} />
            </div>
          ))}
        </Slider>

        <div className="see-more">
          <Link to="/products">
            <ButtonComponent
              className="btn-see-more"
              size={"large"}
              textButton={textButton}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
