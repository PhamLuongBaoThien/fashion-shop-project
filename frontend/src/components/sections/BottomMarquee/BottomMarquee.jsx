import React from "react";
import "./BottomMarquee.css";

const BottomMarquee = () => {
  const messages = [
    "Phong cách của bạn – nguồn cảm hứng của chúng tôi",
    "Đẳng cấp được tạo nên từ chi tiết nhỏ nhất",
    "Hãy để outfit của bạn kể câu chuyện riêng",
    "Đơn giản nhưng đầy tinh tế",
  ];

  return (
    <div className="marquee-wrapper">
      <div className="marquee">
        <div className="marquee-track">
          {messages.map((msg, i) => (
            <span key={i} className="marquee-item">
              {msg}
            </span>
          ))}
          {/* lặp thêm để cuộn mượt */}
          {messages.map((msg, i) => (
            <span key={i + "-dup"} className="marquee-item">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomMarquee;
