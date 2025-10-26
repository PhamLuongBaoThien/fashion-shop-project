"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./EditProfile.css";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import { updateUser } from "../../redux/slides/userSlide";
import { useMutationHooks } from "../../hooks/useMutationHook";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const EditProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Initialize form with user data from Redux
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username || "", // Đồng bộ với Backend
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      });
    }
  }, [user, form]);

  const mutation = useMutationHooks((data) => {
    const { _id, ...rest } = data;
    return UserService.updateUser(_id, rest);
  });

  const { data, isPending, isSuccess, isError } = mutation;

  const onFinish = (values) => {
    setLoading(true);
    const updatedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : null,
    };
    mutation.mutate(
      { _id: user.id, ...updatedValues },
      {
        onSuccess: () => {
          dispatch(updateUser({ ...user, _id: user.id, ...updatedValues }));
          message.success("Cập nhật thông tin thành công!");
          navigate("/profile");
        },
        onError: (error) => {
          message.error(`Cập nhật thất bại: ${error.message}`);
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess && data) {
      setLoading(false);
    } else if (isError) {
      setLoading(false);
    }
  }, [isSuccess, isError, data]);

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className="edit-profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="edit-profile-header">
        <h1>Chỉnh sửa thông tin cá nhân</h1>
      </div>
      <motion.div
        className="edit-profile-container"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="form-section" variants={itemVariants}>
          <Form
            form={form}
            name="editProfile"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="edit-form"
          >
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username" // Thay fullName bằng username
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                  ]}
                >
                  <Input placeholder="Nguyễn Văn A" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    placeholder="example@email.com"
                    size="large"
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    // Bạn có thể bỏ dòng 'required' nếu không muốn bắt buộc người dùng nhập SĐT
                    // { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      // Nếu người dùng có nhập, nó phải khớp với định dạng này
                      required: true,
                      pattern: /^(84|0[3|5|7|8|9])[0-9]{8}$/,
                      message: "Số điện thoại không đúng định dạng Việt Nam!",
                    },
                  ]}
                >
                  <Input placeholder="0912345678" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select
                    placeholder="Chọn giới tính"
                    size="large"
                    options={[
                      { label: "Nam", value: "male" },
                      { label: "Nữ", value: "female" },
                      { label: "Khác", value: "other" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="address" label="Địa chỉ">
                  <Input
                    placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-actions">
              <Link to="/profile">
                <ButtonComponent size="large" className="cancel-btn" textButton={"Hủy"} />
                  
              </Link>
              <ButtonComponent
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
                className="submit-btn"
                textButton={"Lưu thay đổi"}
              />
            </div>
          </Form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EditProfile;
