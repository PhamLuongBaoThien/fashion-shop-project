import React from "react";

const BannerComponent = ({ imgBanner1 }) => {
  return (
    <div>
      <img
        src={imgBanner1}
        alt="banner"
        style={{
          width: "100%",
          height: "100vh",
          objectFit: "cover", // ảnh full màn không méo
        }}
      />
    </div>
  );
};

export default BannerComponent;
