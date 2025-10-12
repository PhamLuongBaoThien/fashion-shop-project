"use client";

import { useRef } from "react";
import Slider from "react-slick";
import { Button, Typography } from "antd";
import "./SliderComponent.css";
import Slider1 from "../../../assets/images/Slider1.jpeg";
import Slider2 from "../../../assets/images/Slider2.jpg";
import Slider3 from "../../../assets/images/Slider3.jpg";  

const { Title, Paragraph } = Typography;

export default function SliderComponent() {
  const sliderRef = useRef(null); // dùng useRef

  const collections = [
    {
      id: 1,
      title: "Xuân Hè 2025",
      description:
        "Khám phá bộ sưu tập mới với những thiết kế tươi mới, nhẹ nhàng và đầy sức sống",
      image: Slider1,
      cta: "Khám phá ngay",
    },
    {
      id: 2,
      title: "Thu Đông 2025",
      description:
        "Ấm áp và thanh lịch với những thiết kế tinh tế cho mùa thu đông",
      image: Slider2,
      cta: "Xem bộ sưu tập",
    },
    {
      id: 3,
      title: "Capsule Collection",
      description:
        "Bộ sưu tập giới hạn với những món đồ cơ bản nhưng không kém phần tinh tế",
      image: Slider3,
      cta: "Mua ngay",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    appendDots: (dots) => <div className="custom-dots">{dots}</div>,
    customPaging: () => <div className="custom-dot" />,
  };

  // Gọi hàm từ ref
  const handlePrev = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();

  return (
    <section className="collections-section">
      <div className="collections-container">
        <Title level={2} className="collections-title">
          Bộ sưu tập
        </Title>
        <Paragraph className="collections-desc">
          Từng bộ sưu tập là một câu chuyện riêng, thể hiện phong cách và cá
          tính độc đáo
        </Paragraph>

        <div className="slider-wrapper">
          {/* Gắn ref vào Slider */}
          <Slider ref={sliderRef} {...settings}>
            {collections.map((collection) => (
              <div key={collection.id}>
                <div
                  className="collection-slide"
                  style={{ backgroundImage: `url(${collection.image})` }}
                >
                  <div className="overlay" />
                  <div className="collection-content">
                    <Title level={1} className="collection-heading">
                      {collection.title}
                    </Title>
                    <Paragraph className="collection-text">
                      {collection.description}
                    </Paragraph>
                    <Button size="large" className="collection-btn">
                      {collection.cta}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          {/* Click zone left/right */}
          <div className="click-zone left" onClick={handlePrev}></div>
          <div className="click-zone right" onClick={handleNext}></div>
        </div>
      </div>
    </section>
  );
}
