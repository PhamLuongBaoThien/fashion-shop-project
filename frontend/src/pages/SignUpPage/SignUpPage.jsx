import React from "react";
import SignUpComponent from "../../components/Auth/SignUpComponent/SignUpComponent";
import AuthLeftComponent from "../../components/Auth/AuthLeftComponent/AuthLeftComponent";
import { motion } from "framer-motion";

const SignUpPage = () => {
  return (
    <div className="auth-page">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AuthLeftComponent textContent={"Đăng ký để trải nghiệm mua sắm tuyệt vời"} />
      </motion.div>

      <div className="auth-right">
        <SignUpComponent />
      </div>
    </div>
  );
};

export default SignUpPage;
