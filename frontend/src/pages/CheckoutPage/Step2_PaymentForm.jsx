import React from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Typography,
  Space,
  Radio,
  Divider,
} from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const { Title, Text } = Typography;

// Component chỉ render Form của Bước 1
export default function Step2_PaymentForm({
  onPlaceOrder,
  onBack,
  isProcessing,
  paymentMethod,
  setPaymentMethod,
  isDifferentAddress,
}) {
  return (
    <Form
      layout="vertical"
      size="large"
      onFinish={onPlaceOrder} // Gọi thẳng hàm đặt hàng
    >
      <Title level={4} style={{ marginBottom: "24px" }}>
        Thông tin thanh toán
      </Title>

      <Radio.Group
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Radio value="card">
            <Text strong>Thanh toán bằng thẻ tín dụng</Text>
          </Radio>
          <Radio value="bank">
            <Text strong>Chuyển khoản ngân hàng</Text>
          </Radio>
          <Radio value="cod" disabled={isDifferentAddress}>
            <Text strong>Thanh toán khi nhận hàng (COD)</Text>
            {isDifferentAddress && (
              <div style={{ fontSize: "12px", color: "#999" }}>
                (Không áp dụng cho đơn hàng tặng)
              </div>
            )}
          </Radio>
        </Space>
      </Radio.Group>

      {paymentMethod === "card" && (
        <div style={{ marginTop: "24px" }}>
          <Form.Item
            label="Số thẻ"
            rules={[{ required: true, message: "Vui lòng nhập số thẻ!" }]}
          >
            <Input
              prefix={<CreditCardOutlined />}
              placeholder="0000 0000 0000 0000"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                label="Hạn sử dụng"
                rules={[
                  { required: true, message: "Vui lòng nhập hạn sử dụng!" },
                ]}
              >
                <Input placeholder="MM/YY" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                label="CVV"
                rules={[{ required: true, message: "Vui lòng nhập CVV!" }]}
              >
                <Input placeholder="123" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )}

      <Divider />

      <Space
        style={{
          width: "100%",
          marginBottom: "24px",
          gap: "12px",
        }}
      >
        <ButtonComponent
          block
          size="large"
          onClick={onBack} // Gọi hàm quay lại
          style={{
            height: "48px",
            fontSize: "16px",
            borderColor: "#1a1a1a",
            color: "#1a1a1a",
            border: "3px solid",
          }}
          textButton={"Quay lại"}
        />

        <ButtonComponent
          type="primary"
          htmlType="submit"
          block
          loading={isProcessing}
          size="large"
          style={{
            backgroundColor: "#fa8c16",
            borderColor: "#fa8c16",
            height: "48px",
            fontSize: "16px",
          }}
          textButton={"Đặt hàng"}
        />
      </Space>
    </Form>
  );
}
