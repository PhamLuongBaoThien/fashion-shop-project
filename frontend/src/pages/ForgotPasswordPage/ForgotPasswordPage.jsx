import React,{useEffect} from 'react';
import { Button, Input, Form } from 'antd';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as UserService from '../../services/UserService';
import { useMessageApi } from "../../context/MessageContext";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import AuthLeftComponent from "../../components/Auth/AuthLeftComponent/AuthLeftComponent";
import InputComponent from "../../components/common/InputComponent/InputComponent";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

import "../../components/Auth/SignInComponent/SignInComponent.css"; 

const ForgotPasswordPage = () => {
    const { messageApi } = useMessageApi();
    const navigate = useNavigate();
    
    // Mutation gửi API
    const mutation = useMutationHooks(data => UserService.forgotPassword(data));
    const { data, isPending, isSuccess, isError, error } = mutation;

    // Xử lý khi Submit Form
    const onFinish = (values) => {
        mutation.mutate(values.email);
    };

    // Xử lý kết quả trả về từ API
    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            messageApi.success(data.message || "Vui lòng kiểm tra email của bạn!");
        } else if (data?.status === 'ERR' || isError) {
            messageApi.error(data?.message || error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    }, [isSuccess, isError, data, error, messageApi]);

    // Animation Variants (Giống SignInComponent)
    const formVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="auth-page">
            {/* PHẦN BÊN TRÁI (LOGO & TEXT) */}
            <motion.div
                className="auth-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <AuthLeftComponent
                    textContent={"Khôi phục quyền truy cập vào tài khoản của bạn"}
                />
            </motion.div>

            {/* PHẦN BÊN PHẢI (FORM) */}
            <div className="auth-right">
                <div className="auth-form-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="auth-header">
                            <h1>Quên mật khẩu?</h1>
                            <p>Nhập email để nhận liên kết đặt lại mật khẩu</p>
                        </div>

                        <motion.div
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Form
                                name="forgot-password"
                                onFinish={onFinish}
                                layout="vertical"
                                requiredMark={false}
                            >
                                <motion.div variants={itemVariants}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập email!" },
                                            { type: "email", message: "Email không hợp lệ!" },
                                        ]}
                                    >
                                        <InputComponent
                                            prefix={<MailOutlined />}
                                            placeholder="example@email.com"
                                            size="large"
                                        />
                                    </Form.Item>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Form.Item>
                                        <ButtonComponent
                                            size="large"
                                            textButton="Gửi yêu cầu"
                                            styleButton={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                background: "#2d2d2d",
                                                border: "none",
                                            }}
                                            htmlType="submit"
                                            loading={isPending}
                                            block
                                            className="auth-submit-btn"
                                        />
                                    </Form.Item>
                                </motion.div>
                            </Form>

                            {/* Nút Quay lại */}
                            <motion.div variants={itemVariants} className="auth-toggle" style={{justifyContent: 'center'}}>
                                <Link to="/sign-in" className="auth-toggle-btn" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <ArrowLeftOutlined /> Quay lại đăng nhập
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;