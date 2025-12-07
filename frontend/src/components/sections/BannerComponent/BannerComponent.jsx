import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // THÊM DÒNG NÀY
import "./BannerComponent.css"
const BannerComponent = ({ imgBanner1 }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useSelector((state) => state.user); // LẤY THÔNG TIN USER TỪ REDUX

  const getTypingTexts = () => {
    if (user?.id) {
      // ĐÃ ĐĂNG NHẬP → ấm áp, sang trọng, gần gũi
      return [
        `Chào ${user?.username || "bạn"}!`,
        "Lâu rồi không gặp!",
        "Giỏ hàng vẫn còn nhớ bạn lắm!",
        "Cảm ơn bạn đã chọn chúng mình!",
      ];
    } else {
      // CHƯA ĐĂNG NHẬP → mời gọi nhẹ nhàng, không nài nỉ
      return [
        "Đăng nhập để nhận ưu đãi riêng!",
        "Mở tài khoản – mở thêm nghìn deal hot!",
        "Trở thành hội viên trong 5 giây thôi!",
      ];
    }
  };
  const texts = getTypingTexts();

  useEffect(() => {
    setIndex(0);
    setSubIndex(0);
    setIsDeleting(false);
  }, [user?.id]);

  useEffect(() => {
    if (!texts[index]) return;

    const timeout = setTimeout(
      () => {
        const currentText = texts[index];

        if (!isDeleting) {
          // đang gõ
          if (subIndex < currentText.length) {
            setSubIndex(subIndex + 1);
          } else {
            // chờ 1 tí rồi bắt đầu xoá
            setTimeout(() => setIsDeleting(true), 1000);
          }
        } else {
          // đang xoá
          if (subIndex > 0) {
            setSubIndex(subIndex - 1);
          } else {
            // chuyển sang chữ tiếp theo
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 50 : 70
    ); // tốc độ gõ/xoá

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, texts]);

    const currentTextToRender = texts[index] || ""; 


  return (
    <div style={{ position: "relative" }}>
      <img
        src={imgBanner1}
        alt="banner"
        style={{
          width: "100%",
          height: "100vh",
          objectFit: "cover",
        }}
      />

      {/* Text Typing */}
      <h1 className="banner-text">
        {currentTextToRender.substring(0, subIndex)}
        <span className="caret">|</span>
      </h1>

      {/* Caret blink */}
      <style>
        {`
   .caret {
     display: inline-block;
     margin-left: 2px;
     animation: blink 0.8s infinite;
   }
   @keyframes blink {
     0%, 50% { opacity: 1; }
     50.01%, 100% { opacity: 0; }
   }
 `}
      </style>
    </div>
  );
};

export default BannerComponent;
