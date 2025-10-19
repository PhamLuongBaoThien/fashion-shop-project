import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./AuthLeftComponent.css";

const AuthLeftComponent = ({textContent}) => {
  return (
            <div className="auth-left-content">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div
              className="auth-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              D.E
            </motion.div>
          </Link>
          <motion.p
            className="auth-left-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {textContent}
          </motion.p>
        </div>
  );
};

export default AuthLeftComponent;