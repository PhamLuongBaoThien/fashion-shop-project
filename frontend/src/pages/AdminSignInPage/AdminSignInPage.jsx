import React, {useEffect} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminSignInComponent from "../../components/Auth/AdminSignInComponent/AdminSignInComponent";
import AdminAuthLeftComponent from "../../components/Auth/AdminAuthLeftComponent/AdminAuthLeftComponent";

const AdminSignInPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  useEffect(() => {
        // Nếu user.id đã tồn tại (nghĩa là đã đăng nhập)
        if (user.id && user.isAdmin) {
            navigate('/system/admin'); // Chuyển hướng về admin
        }
    }, [user.id, user.isAdmin, navigate]); // Chạy lại khi user.id hoặc navigate thay đổi

  return (
    <div className="auth-page">
      <motion.div
        className="admin-auth-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AdminAuthLeftComponent
          textContent={"Cai trị cửa hàng tốt là việc của bạn"}
        />
      </motion.div>

      <div className="auth-right">
        <AdminSignInComponent />
      </div>
    </div>
  );
};

export default AdminSignInPage;
