import React from "react";
import { motion } from "framer-motion";

import AdminSignInComponent from "../../components/Auth/AdminSignInComponent/AdminSignInComponent";
import AdminAuthLeftComponent from "../../components/Auth/AdminAuthLeftComponent/AdminAuthLeftComponent";

const AdminSignInPage = () => {
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
