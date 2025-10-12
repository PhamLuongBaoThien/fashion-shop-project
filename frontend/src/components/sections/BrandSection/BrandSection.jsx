import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./BrandSection.css"; // bạn có thể thêm CSS riêng nếu muốn
import logo1 from "../../../assets/images/M1_logo_01.png";
import logo2 from "../../../assets/images/M1_logo_02.png";
import logo3 from "../../../assets/images/M1_logo_03.png";
import logo4 from "../../../assets/images/M1_logo_04.png";
import logo5 from "../../../assets/images/M1_logo_05.png";
import imgBottom1 from "../../../assets/images/m1_ins_01.jpg";
import imgBottom2 from "../../../assets/images/m1_ins_02.jpg";
import imgBottom3 from "../../../assets/images/m1_ins_03.jpg";
import imgBottom4 from "../../../assets/images/m1_ins_04.jpg";
import imgBottom5 from "../../../assets/images/m1_ins_05.jpg";

const BrandSection = () => {
  // slider logo thương hiệu (trên)
  const settingsTop = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 10000,
    // cssEase: "linear", dừng mỗi khi chạy đủ 4 item
    rtl: true, // chạy từ phải sang trái
    arrows: false,
    pauseOnHover: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // slider ảnh sản phẩm (dưới)
  const settingsBottom = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 15000,
    cssEase: "linear",
    arrows: false,
    pauseOnHover: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // danh sách logo thương hiệu
  const brands = [logo1, logo2, logo3, logo4, logo5];

  // danh sách hình ảnh sản phẩm
  const images = [
    imgBottom1,
    imgBottom2,
    imgBottom3,
    imgBottom4,
    imgBottom5,

  ];

  return (
    <div className="brand-section">
      {/* slider logo thương hiệu */}
      <div className="brand-slider">
        <Slider {...settingsTop}>
          {brands.map((brand, index) => (
            <div key={index} className="brand-item">
              <img src={brand} alt={brand} />
            </div>
          ))}
        </Slider>
      </div>

      {/* slider ảnh sản phẩm */}
      <div className="product-slider">
        <Slider {...settingsBottom}>
          {images.map((src, index) => (
            <div key={index} className="product-item">
              <img src={src} alt={`slide-${index}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default BrandSection;
