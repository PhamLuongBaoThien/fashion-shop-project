"use client"

import { motion } from "framer-motion"
import { HomeOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import "./NotFoundPage.css"
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent"

function NotFoundPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="not-found-page">
      {/* Decorative circles */}
      <motion.div
        className="circle circle-1"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="circle circle-2"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <motion.div className="not-found-container" variants={containerVariants} initial="hidden" animate="visible">
        {/* 404 Number */}
        <motion.div className="not-found-number" variants={itemVariants}>
          <motion.span variants={floatingVariants} animate="animate">
            404
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.h1 className="not-found-title" variants={itemVariants}>
          Trang không tìm thấy
        </motion.h1>

        {/* Description */}
        <motion.p className="not-found-description" variants={itemVariants}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          <br />
          Hãy quay lại trang chủ để tiếp tục mua sắm.
        </motion.p>

        {/* Illustration */}
        <motion.div className="not-found-illustration" variants={itemVariants}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="#E8E8E8" strokeWidth="2" />
            <path d="M70 80 Q100 60 130 80" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="90" r="5" fill="#1a1a1a" />
            <circle cx="120" cy="90" r="5" fill="#1a1a1a" />
            <path d="M85 120 Q100 130 115 120" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Button */}
        <motion.div className="not-found-button" variants={itemVariants}>
          <Link to="/">
            <ButtonComponent type="primary" textButton={"Quay lại trang chủ"} size="large" icon={<HomeOutlined />} className="home-button" />
              
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage;