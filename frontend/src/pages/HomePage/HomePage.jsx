import React from "react";
import { motion } from "framer-motion";
import HeroSection from "../../components/sections/HeroSection/HeroSection.jsx";
import FeaturedProducts from "../../components/sections/FeaturedProducts/FeaturedProducts.jsx";
import CollectionsSlider from "../../components/sections/SliderComponent/SliderComponent.jsx";
import imgHeroSection from "../../assets/images/HeroSection.jpg";
import BrandSection from "../../components/sections/BrandSection/BrandSection.jsx";
import BottomMarquee from "../../components/sections/BottomMarquee/BottomMarquee.jsx";
import BannerComponent from "../../components/sections/BannerComponent/BannerComponent.jsx";
import imgBanner1 from "../../assets/images/Banner1.jpg";

const HomePage = () => {
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
        viewport={{ once: true, amount: 0.3 }} /*Animation chỉ chạy một lần khi 30% section xuất hiện trong viewport.*/
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
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <FeaturedProducts />
      </motion.div>
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
