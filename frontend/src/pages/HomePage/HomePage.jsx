import React from "react";
import { motion } from "framer-motion";
import { Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";

import HeroSection from "../../components/sections/HeroSection/HeroSection.jsx";
import FeaturedProducts from "../../components/sections/FeaturedProducts/FeaturedProducts.jsx";
import CollectionsSlider from "../../components/sections/SliderComponent/SliderComponent.jsx";
import imgHeroSection from "../../assets/images/HeroSection.jpg";
import BrandSection from "../../components/sections/BrandSection/BrandSection.jsx";
import BottomMarquee from "../../components/sections/BottomMarquee/BottomMarquee.jsx";
import BannerComponent from "../../components/sections/BannerComponent/BannerComponent.jsx";
import imgBanner1 from "../../assets/images/Banner1.jpg";

import * as ProductService from "../../services/ProductService.js"; //

const HomePage = () => {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await ProductService.getAllProducts();
      return res?.data || []; // Trả về mảng data hoặc mảng rỗng nếu có lỗi
    },
    retry: 3, // Thử lại 3 lần nếu lỗi
    retryDelay: 1000, // Chờ 1s giữa các lần thử
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (isError) {
    return (
      <Alert message="Lỗi" description={error.message} type="error" showIcon />
    );
  }

  const featuredProducts = products?.slice(0, 5) || []; // Lấy 4 sản phẩm đầu tiên để truyền vào FeaturedProducts

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };
  return (
    <div>
      {/* <div>HomePage</div> */}
      {/* Banner Component with animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.3,
        }} /*Animation chỉ chạy một lần khi 30% section xuất hiện trong viewport.*/
        variants={fadeVariants}
      >
        <BannerComponent imgBanner1={imgBanner1} />
      </motion.div>
      {/* Hero Section with animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <HeroSection imgHeroSection={imgHeroSection} />
      </motion.div>
      {/* Featured Products with animation */}
      {featuredProducts.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <FeaturedProducts products={featuredProducts} textButton={"Xem tất cả sản phẩm"} />
        </motion.div>
      )}

      {/* Collections Slider with animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <CollectionsSlider />
      </motion.div>
      {/* Brand Section with animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <BrandSection />
      </motion.div>
      <BottomMarquee />
    </div>
  );
};

export default HomePage;
