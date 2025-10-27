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
  Avatar,
  Upload,
} from "antd";
import { CameraOutlined } from "@ant-design/icons";
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
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [avatarFile, setAvatarFile] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
  const [previewImage, setPreviewImage] = useState("");

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
      setPreviewImage(user.avatar); // Hiển thị avatar hiện tại
    }
  }, [user, form]);

  // const handleAvatarChange = (info) => {
  //   if (info.file.status === "done") {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       setAvatar(e.target.result);
  //       message.success("Cập nhật ảnh đại diện thành công!");
  //     };
  //     reader.readAsDataURL(info.file.originFileObj);
  //   }
  // };
  const mutation = useMutationHooks((data) => {
    const { _id, formData } = data;
    return UserService.updateUser(_id, formData);
  });

  const { data, isPending, isSuccess, isError } = mutation;

  const handleBeforeUpload = (file) => {
    setAvatarFile(file); // Lưu file thật vào state
    setPreviewImage(URL.createObjectURL(file)); // Tạo URL tạm để xem trước
    return false; // Ngăn Ant Design tự động upload
  };

  const onFinish = (values) => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key === "dateOfBirth" && values[key]) {
        formData.append(key, values[key].format("YYYY-MM-DD"));
      } else if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    if (avatarFile instanceof File) { // Sửa: Chỉ append nếu avatarFile là một File
        formData.append("avatar", avatarFile);
    }

    mutation.mutate(
      { _id: user.id, formData },
      {
        onSuccess: (data) => {
          // `data` có thể là `{ status: 'OK', data: user }` hoặc chỉ là `user`
    // Cách lấy an toàn nhất: Nếu data.data tồn tại thì lấy, nếu không thì coi chính data là user
    const updatedUserFromServer = data?.data;

    // Kiểm tra xem chúng ta có thực sự lấy được object user không
    if (updatedUserFromServer?._id) {
        dispatch(updateUser(updatedUserFromServer));
        message.success("Cập nhật thông tin thành công!");
        navigate("/profile");
    } else {
        // Nếu không lấy được, báo lỗi để biết
        message.error("Không nhận được dữ liệu người dùng từ máy chủ.");
        console.error("Dữ liệu không hợp lệ từ onSuccess:", data);
    }
        },
        onError: (error) => {
          message.error(
            `Cập nhật thất bại: ${error.message || "Đã có lỗi xảy ra"}`
          );
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
        <motion.div className="avatar-section" variants={itemVariants}>
          <div className="avatar-container">
            <Avatar
              size={150}
src={previewImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} // <-- FIX: Use the previewImage state              className="edit-avatar"
            />
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              className="avatar-upload"
            >
              <Button icon={<CameraOutlined />} className="upload-btn">
                Thay đổi ảnh
              </Button>
            </Upload>
          </div>
        </motion.div>

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
                <ButtonComponent
                  size="large"
                  className="cancel-btn"
                  textButton={"Hủy"}
                />
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
