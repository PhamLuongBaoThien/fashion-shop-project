import React, {useEffect} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SignInComponent from "../../components/Auth/SignInComponent/SignInComponent";
import AuthLeftComponent from "../../components/Auth/AuthLeftComponent/AuthLeftComponent";

const SignInPage = () => {
  return (
    <div className="auth-page">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AuthLeftComponent
          textContent={"Khám phá phong cách thời trang của riêng bạn"}
        />
      </motion.div>

      <div className="auth-right">
        <SignInComponent />
      </div>
    </div>
  );
};

export default SignInPage;
