import React from 'react';
import { Form } from 'antd';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as UserService from '../../services/UserService';
import { useMessageApi } from "../../context/MessageContext";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";

// Import các component dùng chung
import AuthLeftComponent from "../../components/Auth/AuthLeftComponent/AuthLeftComponent";
import InputComponent from "../../components/common/InputComponent/InputComponent";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

// Import CSS
import "../../components/Auth/SignInComponent/SignInComponent.css";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { messageApi } = useMessageApi();
    
    // Mutation gọi API
    const mutation = useMutationHooks(data => UserService.resetPassword(data));
    const { data, isPending, isSuccess, isError, error } = mutation;

    const onFinish = (values) => {
        const { password, confirmPassword } = values;
        mutation.mutate({ token, password, confirmPassword });
    };

    // Xử lý kết quả trả về
    React.useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            messageApi.success("Đổi mật khẩu thành công! Đang chuyển hướng...");
            navigate('/sign-in');
        } else if (data?.status === 'ERR' || isError) {
            messageApi.error(data?.message || error?.message || "Liên kết không hợp lệ hoặc đã hết hạn!");
        }
    }, [isSuccess, isError, data, error, navigate, messageApi]);

    // Animation Variants
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
            {/* PHẦN BÊN TRÁI */}
            <motion.div
                className="auth-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <AuthLeftComponent
                    textContent={"Thiết lập mật khẩu mới an toàn cho tài khoản của bạn"}
                />
            </motion.div>

            {/* PHẦN BÊN PHẢI */}
            <div className="auth-right">
                <div className="auth-form-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="auth-header">
                            <h1>Đặt lại mật khẩu</h1>
                            <p>Vui lòng nhập mật khẩu mới</p>
                        </div>

                        <motion.div
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Form
                                name="reset-password"
                                onFinish={onFinish}
                                layout="vertical"
                                requiredMark={false}
                            >
                                <motion.div variants={itemVariants}>
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu mới"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                                        ]}
                                    >
                                        <InputComponent
                                            type={"password"}
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập mật khẩu mới"
                                            size="large"
                                        />
                                    </Form.Item>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu"
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <InputComponent
                                            type={"password"}
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập lại mật khẩu mới"
                                            size="large"
                                        />
                                    </Form.Item>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Form.Item>
                                        <ButtonComponent
                                            size="large"
                                            textButton="Xác nhận đổi mật khẩu"
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

                            {/* Nút Quay lại (Phòng trường hợp bấm nhầm link) */}
                            <motion.div variants={itemVariants} className="auth-toggle" style={{justifyContent: 'center'}}>
                                <Link to="/sign-in" className="auth-toggle-btn" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <ArrowLeftOutlined /> Quay về đăng nhập
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;