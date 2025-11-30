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
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./EditProfile.css";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import { updateUser } from "../../redux/slides/userSlide";
import { useMutationHooks } from "../../hooks/useMutationHook";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import * as ExternalApiService from "../../services/ExternalApiService";

const EditProfile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
      // Nếu user.id đã tồn tại (nghĩa là đã đăng nhập)
      if (!user.id) {
        navigate("/sign-in"); // Chuyển hướng về trang chủ
      }
    }, [user.id, navigate]); // Chạy lại khi user.id hoặc navigate thay đổi

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        //  Dùng trực tiếp dữ liệu đã được "dịch"
        const provinceOptions = await ExternalApiService.getProvinces();
        setProvinces(provinceOptions);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceCode) => {
    try {
      //  Dùng trực tiếp dữ liệu đã được "dịch"
      const districtOptions = await ExternalApiService.getDistricts(provinceCode);
      setDistricts(districtOptions);
      setWards([]);
      form.setFieldsValue({ district: null, ward: null });
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

  const handleDistrictChange = async (districtCode) => {
    try {
      //  Dùng trực tiếp dữ liệu đã được "dịch"
      const wardOptions = await ExternalApiService.getWards(districtCode);
      setWards(wardOptions);
      form.setFieldsValue({ ward: null });
    } catch (error) {
      console.error("Failed to fetch wards:", error);
    }
  };

  // 1. useEffect để điền thông tin cơ bản
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
        address: {
          detailAddress: user.address?.detailAddress,
        },
      });
      setPreviewImage(user.avatar);
    }
  }, [user, form]);

  // 2. useEffect riêng để xử lý Tỉnh
  useEffect(() => {
    if (user?.address?.province && provinces.length > 0) {
      const savedProvince = provinces.find(
        (p) => p.label === user.address?.province
      );
      if (savedProvince) {
        form.setFieldsValue({ address: { province: savedProvince.value } });
        handleProvinceChange(savedProvince.value); // Tải danh sách huyện
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.address?.province, provinces]);

  // 3. useEffect riêng để xử lý Huyện
  useEffect(() => {
    if (user?.address?.district && districts.length > 0) {
      const savedDistrict = districts.find(
        (d) => d.label === user.address?.district
      );
      if (savedDistrict) {
        form.setFieldsValue({ address: { district: savedDistrict.value } });
        handleDistrictChange(savedDistrict.value); // Tải danh sách xã
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.address?.district, districts]);

  // 4. useEffect riêng để xử lý Xã
  useEffect(() => {
    if (user?.address?.ward && wards.length > 0) {
      const savedWard = wards.find((w) => w.label === user.address?.ward);
      if (savedWard) {
        form.setFieldsValue({ address: { ward: savedWard.value } });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.address?.ward, wards]);

  const mutation = useMutationHooks((data) => {
    const { _id, formData } = data;
    return UserService.updateUser(_id, formData);
  });
  const { isPending } = mutation;

  const handleBeforeUpload = (file) => {
    setAvatarFile(file);
    setPreviewImage(URL.createObjectURL(file));
    return false;
  };

  const onFinish = (values) => {
    const formData = new FormData();

    const addressValues = values.address || {};
    const provinceName = provinces.find(
      (p) => p.value === addressValues.province
    )?.label;
    const districtName = districts.find(
      (d) => d.value === addressValues.district
    )?.label;
    const wardName = wards.find((w) => w.value === addressValues.ward)?.label;

    formData.append("address[province]", provinceName || "");
    formData.append("address[district]", districtName || "");
    formData.append("address[ward]", wardName || "");
    formData.append(
      "address[detailAddress]",
      addressValues.detailAddress || ""
    );

    Object.keys(values).forEach((key) => {
      if (key !== "address") {
        // Chỉ xử lý các key không phải 'address'
        if (key === "dateOfBirth" && values[key]) {
          formData.append(key, values[key].format("YYYY-MM-DD"));
        } else if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      }
    });

    if (avatarFile instanceof File) {
      formData.append("avatar", avatarFile);
    }

    mutation.mutate(
      { _id: user.id, formData },
      {
        onSuccess: (data) => {
          const updatedUserFromServer = data?.data;
          dispatch(updateUser(updatedUserFromServer));
          message.success("Cập nhật thông tin thành công!");
          navigate("/profile");
        },
        onError: (error) =>
          message.error(
            `Cập nhật thất bại: ${error.message || "Đã có lỗi xảy ra"}`
          ),
      }
    );
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
        initial="hidden"
        animate="visible"
      >
        <motion.div className="avatar-section">
          <div className="avatar-container">
            <Avatar
              size={150}
              src={previewImage}
              icon={<UserOutlined />}
              className="edit-avatar"
            />
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              className="avatar-upload"
            >
              <ButtonComponent icon={<CameraOutlined />} className="upload-btn" textButton={"Thay đổi ảnh"} />
                
            </Upload>
          </div>
        </motion.div>
        <motion.div className="form-section">
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
                  name="username"
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
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
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
            </Row>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name={["address", "province"]}
                  label="Tỉnh/Thành phố"
                >
                  <Select
                    placeholder="Chọn Tỉnh/Thành"
                    size="large"
                    onChange={handleProvinceChange}
                    options={provinces}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name={["address", "district"]} label="Quận/Huyện">
                  <Select
                    placeholder="Chọn Quận/Huyện"
                    size="large"
                    onChange={handleDistrictChange}
                    options={districts}
                    disabled={!districts.length}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name={["address", "ward"]} label="Phường/Xã">
                  <Select
                    placeholder="Chọn Phường/Xã"
                    size="large"
                    options={wards}
                    disabled={!wards.length}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  name={["address", "detailAddress"]}
                  label="Địa chỉ cụ thể (Số nhà, tên đường...)"
                >
                  <Input
                    placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
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
