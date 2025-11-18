import React from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Radio,
  Divider,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Title, Text } = Typography;

// Component chỉ render Form của Bước 0
export default function Step1_ShippingForm({
  form,
  onFinishStep1,
  isDifferentAddress,
  setIsDifferentAddress,
  paymentMethod,
  setPaymentMethod,
  provinces,
  districts,
  wards,
  isProvincesLoading,
  isDistrictsLoading,
  isWardsLoading,
  handleProvinceChange,
  handleDistrictChange,
  shippingMethod,
  setShippingMethod,
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      onFinish={onFinishStep1}
    >
      <Title level={4} style={{ marginBottom: "24px" }}>
        Thông tin người mua
      </Title>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name={["customerInfo", "fullName"]}
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name={["customerInfo", "email"]}
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name={["customerInfo", "phone"]}
        label="Số điện thoại"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item name="isDifferentAddress" valuePropName="checked">
        <Checkbox
          checked={isDifferentAddress}
          onChange={(e) => {
            const checked = e.target.checked;
            setIsDifferentAddress(checked);

            if (checked) {
              form.setFieldsValue({
                shippingInfo: {
                  fullName: "",
                  phone: "",
                },
              });
              if (paymentMethod === "cod") {
                setPaymentMethod("card");
              }
            } else {
              const customer = form.getFieldValue("customerInfo");
              form.setFieldsValue({
                shippingInfo: {
                  fullName: customer?.fullName,
                  phone: customer?.phone,
                },
              });
            }
          }}
        >
          Đơn hàng tặng người khác
        </Checkbox>
      </Form.Item>

      {isDifferentAddress && (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name={["shippingInfo", "fullName"]}
                label="Họ và tên người nhận"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên người nhận!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn B" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name={["shippingInfo", "phone"]}
                label="Số điện thoại người nhận"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập SĐT người nhận!",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="SĐT người nhận" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name={["shippingInfo", "province"]}
            label="Tỉnh/Thành phố"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn Tỉnh/Thành phố!",
              },
            ]}
          >
            <Select
              placeholder="Chọn Tỉnh/Thành"
              loading={isProvincesLoading}
              onChange={handleProvinceChange}
              options={provinces}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name={["shippingInfo", "district"]}
            label="Quận/Huyện"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn Quận/Huyện!",
              },
            ]}
          >
            <Select
              placeholder="Chọn Quận/Huyện"
              loading={isDistrictsLoading}
              onChange={handleDistrictChange}
              options={districts}
              disabled={!districts.length}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name={["shippingInfo", "ward"]}
            label="Phường/Xã"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn Phường/Xã!",
              },
            ]}
          >
            <Select
              placeholder="Chọn Phường/Xã"
              loading={isWardsLoading}
              options={wards}
              disabled={!wards.length}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name={["shippingInfo", "detailAddress"]}
            label="Địa chỉ chi tiết"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ chi tiết!",
              },
            ]}
          >
            <Input placeholder="Số nhà, tên đường, ..." />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={4} style={{ marginBottom: "24px" }}>
        Phương thức vận chuyển
      </Title>

      <Radio.Group
        value={shippingMethod}
        onChange={(e) => setShippingMethod(e.target.value)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Radio Standard */}
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Radio value="standard">
              <div>
                <Text strong>Vận chuyển tiêu chuẩn (3-5 ngày)</Text>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Giao hàng trong 3-5 ngày làm việc
                </div>
              </div>
            </Radio>
            <Text>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(30000)}
            </Text>
          </div>
          {/* Radio Express */}
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Radio value="express">
              <div>
                <Text strong>Vận chuyển nhanh (1-2 ngày)</Text>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Giao hàng trong 1-2 ngày làm việc
                </div>
              </div>
            </Radio>
            <Text>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(60000)}
            </Text>
          </div>
          {/* Radio Overnight */}
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Radio value="overnight">
              <div>
                <Text strong>Vận chuyển qua đêm (giao hôm sau)</Text>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  Giao hàng vào sáng hôm sau
                </div>
              </div>
            </Radio>
            <Text>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(100000)}
            </Text>
          </div>
        </Space>
      </Radio.Group>

      <Form.Item style={{ marginTop: "24px" }}>
        <ButtonComponent
          type="primary"
          htmlType="submit"
          block
          size="large"
          style={{
            backgroundColor: "#fa8c16",
            borderColor: "#fa8c16",
            height: "48px",
            fontSize: "16px",
          }}
          textButton={"Tiếp tục thanh toán"}
        /> 
      </Form.Item>
    </Form>
  );
}