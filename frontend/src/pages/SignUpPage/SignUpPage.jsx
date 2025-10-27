import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignUpComponent from "../../components/Auth/SignUpComponent/SignUpComponent";
import AuthLeftComponent from "../../components/Auth/AuthLeftComponent/AuthLeftComponent";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  useEffect(() => {
    // Nếu user.id đã tồn tại (nghĩa là đã đăng nhập)
    if (user.id && !user.isAdmin) {
            navigate('/'); // Chuyển hướng về trang chủ
        }

        if (user.id && user.isAdmin) {
            navigate('/system/admin'); // Chuyển hướng về trang chủ
        }

  }, [user.id, user.isAdmin, navigate]); // Chạy lại khi user.id hoặc navigate thay đổi

  return (
    <div className="auth-page">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AuthLeftComponent
          textContent={"Đăng ký để trải nghiệm mua sắm tuyệt vời"}
        />
      </motion.div>

      <div className="auth-right">
        <SignUpComponent />
      </div>
    </div>
  );
};

export default SignUpPage;
