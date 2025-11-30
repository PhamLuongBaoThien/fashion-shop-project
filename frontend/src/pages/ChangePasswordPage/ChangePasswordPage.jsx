import React from "react";
import { Form, Input, Card, Typography, Row, Col } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutationHooks } from "../../hooks/useMutationHook";
import * as UserService from "../../services/UserService";
import { useMessageApi } from "../../context/MessageContext";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";
import "./ChangePasswordPage.css"

const { Title } = Typography;

const ChangePasswordPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { showSuccess, showError } = useMessageApi();
  const [form] = Form.useForm();

  const mutation = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    return UserService.changePassword(id, rests, token);
  });

  const { isPending } = mutation;

  const onFinish = (values) => {
    mutation.mutate(
      {
        id: user?.id,
        token: user?.access_token,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: (data) => {
          if (data?.status === "OK") {
            showSuccess("Đổi mật khẩu thành công!");
            form.resetFields();
            navigate("/profile");
          } else {
            showError(data?.message || "Đổi mật khẩu thất bại");
          }
        },
        onError: (error) => {
            showError("Có lỗi xảy ra, vui lòng thử lại");
        }
      }
    );
  };

  return (
    <div style={{ padding: "40px 20px", backgroundColor: "#f5f5f5", minHeight: "80vh" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Title level={2}>Đổi mật khẩu</Title>
            <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
          </div>

          <Form
            form={form}
            name="change_password"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="oldPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" size="large" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item>
              {/* --- CONTAINER CHỨA 2 NÚT --- */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {/* 1. NÚT HỦY */}
                <ButtonComponent
                    textButton="Hủy"
                    size="large"
                    className={"cancel-btn"}
                    onClick={() => navigate('/profile')} // Quay về trang Profile
                />

                {/* 2. NÚT LƯU */}
                <ButtonComponent
                    type="primary"
                    htmlType="submit"
                    textButton="Lưu thay đổi"
                    size="large"
                    className={"submit-btn"}
                    loading={isPending}
                />
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;