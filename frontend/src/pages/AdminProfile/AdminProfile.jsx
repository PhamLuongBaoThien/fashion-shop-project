"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Row,
  Col,
  message,
  Tabs,
  Tag,
  Skeleton
} from "antd";
import { 
    UserOutlined, 
    LockOutlined, 
    CameraOutlined, 
    MailOutlined, 
    PhoneOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {useQuery } from "@tanstack/react-query"; 

import * as UserService from "../../services/UserService";
import * as RoleService from "../../services/RoleService"; 
import { updateUser } from "../../redux/slides/userSlide";
import { useMessageApi } from "../../context/MessageContext";
import { useMutationHooks } from "../../hooks/useMutationHook";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const AdminProfile = () => {
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();
  const dispatch = useDispatch();
  const { messageApi } = useMessageApi();
  
  const user = useSelector((state) => state.user);

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");


    // --- 1. LẤY DANH SÁCH ROLE ĐỂ HIỂN THỊ TÊN ---
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["admin-roles-list"],
    queryFn: () => RoleService.getAllRoles(user?.access_token),
    enabled: !!user?.access_token,
  });

  // --- 2. LOGIC TÍNH TOÁN TÊN QUYỀN ---
  const roleDisplay = useMemo(() => {
      // Nếu là email chủ sở hữu
      if (user?.email === 'admin1@gmail.com') {
          return { name: "Super Admin (Owner)", color: "gold" };
      }

      // Tìm role trong danh sách dựa vào ID lưu trong Redux
      const foundRole = rolesData?.data?.find(r => r._id === user?.role || r._id === user?.role?._id);
      
      if (foundRole) {
          // Nếu là Super Admin
          if (foundRole.name === 'Super Admin') return { name: foundRole.name, color: "gold" };
          // Các quyền khác
          return { name: foundRole.name, color: "geekblue" };
      }

      // Fallback nếu không tìm thấy hoặc chưa gán role
      return { name: "Admin (Chưa phân quyền)", color: "default" };
  }, [user, rolesData]);

  // --- 1. FILL DỮ LIỆU VÀO FORM KHI LOAD ---
  useEffect(() => {
    if (user?.id) {
      formInfo.setFieldsValue({
        username: user.username || user.name,
        email: user.email,
        phone: user.phone,
        address: user.address, // Admin có thể chỉ cần địa chỉ text đơn giản
      });
      setPreviewImage(user.avatar);
    }
  }, [user, formInfo]);

  // --- 2. XỬ LÝ UPLOAD ẢNH (Giống EditProfile) ---
  const handleBeforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể upload file JPG/PNG!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    setAvatarFile(file);
    setPreviewImage(URL.createObjectURL(file)); // Preview ảnh ngay lập tức
    return false; // Chặn auto upload của Antd để tự xử lý
  };

  // --- 3. MUTATION: CẬP NHẬT THÔNG TIN ---
  const mutationUpdateInfo = useMutationHooks((data) => {
      const { id, formData } = data;
      // Gọi service updateUser, truyền formData để hỗ trợ upload file
      return UserService.updateUser(id, formData, user?.access_token);
  });

  const { isPending: isLoadingUpdate } = mutationUpdateInfo;

  // --- 4. MUTATION: ĐỔI MẬT KHẨU ---
  const mutationChangePass = useMutationHooks((data) => {
      const { id, body } = data;
      return UserService.changePassword(id, body, user?.access_token);
  });

  const { isPending: isLoadingPass } = mutationChangePass;

  // --- HANDLERS SUBMIT ---
  
  const onFinishInfo = (values) => {
      // Tạo FormData giống EditProfile để gửi file ảnh + text
      const formData = new FormData();

      // Append các trường text
      formData.append("username", values.username);
      formData.append("phone", values.phone);
      // Admin có thể không cần địa chỉ chi tiết kiểu object, hoặc nếu cần thì append tương tự
      // formData.append("address", values.address); 

      // Append file ảnh nếu có thay đổi
      if (avatarFile) {
          formData.append("avatar", avatarFile);
      }

      mutationUpdateInfo.mutate(
        { id: user.id, formData },
        {
            onSuccess: (data) => {
                if(data?.status === 'OK') {
                    messageApi.success("Cập nhật hồ sơ thành công!");
                    // Cập nhật lại Redux Store
                    dispatch(updateUser({ ...data.data, access_token: user?.access_token }));
                } else {
                    messageApi.error(data?.message || "Cập nhật thất bại!");
                }
            },
            onError: (err) => messageApi.error(err.message || "Lỗi kết nối!")
        }
      );
  };

  const onFinishPassword = (values) => {
      mutationChangePass.mutate(
        { 
            id: user.id, 
            body: {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            }
        },
        {
            onSuccess: (data) => {
                if(data?.status === 'OK') {
                    messageApi.success("Đổi mật khẩu thành công!");
                    formPassword.resetFields();
                } else {
                    messageApi.error(data?.message || "Đổi mật khẩu thất bại!");
                }
            },
            onError: (err) => messageApi.error(err.message || "Lỗi kết nối!")
        }
      );
  };

  // Nội dung Tab Thông tin
  const GeneralInfoForm = () => (
      <Form form={formInfo} layout="vertical" onFinish={onFinishInfo} className="admin-profile-form">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
                <div style={{ position: 'relative', marginBottom: 15 }}>
                    <Avatar 
                        size={120} 
                        src={previewImage} 
                        icon={<UserOutlined />} 
                        style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Upload 
                        showUploadList={false}
                        beforeUpload={handleBeforeUpload}
                        accept="image/*"
                    >
                        <Button 
                            shape="circle" 
                            type="primary"
                            icon={<CameraOutlined />} 
                            style={{ position: 'absolute', bottom: 5, right: 5 }} 
                        />
                    </Upload>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.username || "Admin"}</div>
                {isLoadingRoles ? (
                    <Skeleton.Button active size="small" />
                ) : (
                    <Tag color={roleDisplay.color} style={{ fontSize: '14px', padding: '4px 10px' }}>
                        {roleDisplay.name.toUpperCase()}
                    </Tag>
                )}
            </div>

            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Form.Item label="Tên hiển thị" name="username" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input prefix={<UserOutlined />} size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input prefix={<PhoneOutlined />} size="large" />
                    </Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item label="Email (Không thể thay đổi)" name="email">
                        <Input prefix={<MailOutlined />} size="large" disabled style={{ color: '#888', backgroundColor: '#f5f5f5' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
                <ButtonComponent 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    icon={<SaveOutlined />}
                    loading={isLoadingUpdate}
                    textButton="Lưu thay đổi"
                    style={{ minWidth: 150 }}
                />
            </Form.Item>
      </Form>
  );

  // Nội dung Tab Mật khẩu
  const SecurityForm = () => (
      <Form form={formPassword} layout="vertical" onFinish={onFinishPassword} style={{ maxWidth: 600, margin: '0 auto' }}>
            <Form.Item 
                label="Mật khẩu hiện tại" 
                name="currentPassword" 
                rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}
            >
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            
            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Form.Item 
                        label="Mật khẩu mới" 
                        name="newPassword" 
                        rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Ít nhất 6 ký tự' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mật khẩu mới" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item 
                        label="Xác nhận mật khẩu" 
                        name="confirmPassword" 
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
                <ButtonComponent 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    danger 
                    loading={isLoadingPass}
                    textButton="Đổi mật khẩu"
                    style={{ minWidth: 150 }}
                />
            </Form.Item>
      </Form>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="admin-profile-card" style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
         <Tabs 
            defaultActiveKey="1" 
            items={[
                { label: <span><UserOutlined />Thông tin cá nhân</span>, key: '1', children: <GeneralInfoForm /> },
                { label: <span><LockOutlined />Bảo mật & Mật khẩu</span>, key: '2', children: <SecurityForm /> }
            ]}
         />
      </Card>
    </motion.div>
  );
};

export default AdminProfile;