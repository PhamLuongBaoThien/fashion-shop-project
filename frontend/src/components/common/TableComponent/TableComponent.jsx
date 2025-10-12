import React from "react";
import { Table, Image, Badge, Button, Space, Typography } from "antd";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import "./TableComponent.css";

const { Text } = Typography;

const TableComponent = ({ products }) => {
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image) => (
        <Image src={image} alt="Product" width={80} preview={false} />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price, record) => {
        const originalPrice =
          record.discount > 0
            ? Math.round(record.price / (1 - record.discount / 100))
            : null;
        return (
          <Space>
            <Text strong style={{ color: "#fa8c16" }}>
              {price.toLocaleString()}đ
            </Text>
            {originalPrice && (
              <>
                <Text delete style={{ color: "#bfbfbf" }}>
                  {originalPrice.toLocaleString()}đ
                </Text>
                <Text style={{ color: "#52c41a" }}>
                  -{record.discount}%
                </Text>
              </>
            )}
          </Space>
        );
      },
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Nhãn",
      dataIndex: "badge",
      key: "badge",
      render: (badge, record) =>
        badge ? (
          <Badge
            count={badge}
            style={{
              backgroundColor: record.isNew ? "#47c41aff" : "#fa8c16",
            }}
          />
        ) : null,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Hết hàng" ? (
          <Badge count="Hết hàng" style={{ backgroundColor: "#bfbfbf" }} />
        ) : (
          <Text>{status}</Text>
        ),
    },
    {
      title: "Kích cỡ",
      dataIndex: "sizes",
      key: "sizes",
      render: (sizes) =>
        sizes
          .filter((s) => s.quantity > 0)
          .map((s) => s.size)
          .join(", ") || "Hết kích cỡ",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<HeartOutlined />}
            disabled={record.status === "Hết hàng"}
          />
          {record.status !== "Hết hàng" && (
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              style={{ backgroundColor: "#000000a8" }}
            >
              Thêm vào giỏ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      rowKey="id"
      pagination={false}
      className="product-table"
      scroll={{ x: true }} // Responsive cho mobile
    />
  );
};

export default TableComponent;