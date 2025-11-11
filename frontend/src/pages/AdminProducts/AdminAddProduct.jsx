// src/pages/Admin/AdminAddProductPage.jsx

import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Switch,
  Space,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";
import { useMessageApi } from "../../context/MessageContext";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import RichTextEditor from "../../components/common/RichTextEditor/RichTextEditor";
import ButtonComponent from "../../components/common/ButtonComponent/ButtonComponent";

const AdminAddProductPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { messageApi } = useMessageApi();

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const createMutation = useMutation({
    mutationFn: (newProduct) => ProductService.createProduct(newProduct),
    onSuccess: () => {
      messageApi.success("Thêm sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      navigate("/system/admin/products");
    },
    onError: (error) => {
      messageApi.error(`Thêm sản phẩm thất bại: ${error.response.data.message || error.message}`);
    },
  });

  // Hàm tiện ích của Ant Design để lấy file từ sự kiện upload
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = (values) => {
    const formData = new FormData();

    // Thêm các trường dữ liệu text và boolean
    Object.keys(values).forEach((key) => {
      // Các trường là mảng hoặc object cần được chuỗi hóa
      if (key === "sizes" && values[key]) {
        formData.append(key, JSON.stringify(values[key]));
      }
      // Bỏ qua các trường file để xử lý riêng
      else if (
        key !== "image" &&
        key !== "subImage" &&
        values[key] !== undefined &&
        values[key] !== null
      ) {
        formData.append(key, values[key]);
      }
    });

    // Thêm file ảnh chính
    if (values.image && values.image[0]) {
      formData.append("image", values.image[0].originFileObj);
    }

    // Thêm các file ảnh phụ
    if (values.subImage && values.subImage.length > 0) {
      values.subImage.forEach((file) => {
        formData.append("subImage", file.originFileObj);
      });
    }

    createMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="admin-page-header">
          <h1>Thêm Sản phẩm mới</h1>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isActive: true, isNewProduct: false }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên Sản phẩm"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input
                  placeholder="Ví dụ: Áo sơ mi linen cao cấp"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  size="large"
                  loading={isLoadingCategories} // Hiển thị loading khi đang fetch
                  // Map qua dữ liệu từ API
                  options={categoriesData?.data?.map((cat) => ({
                    label: cat.name,
                    value: cat._id, // Giá trị là ID
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
              >
                <InputNumber
                  placeholder="Ví dụ: 1290000"
                  style={{ width: "100%" }}
                  min={0}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Giảm giá (%)" name="discount" initialValue={0}>
                <InputNumber
                  placeholder="Ví dụ: 20"
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            {/* Ant Design Form sẽ tự động truyền 'value' và 'onChange' 
                          cho component con, rất tiện lợi!
                        */}
            <RichTextEditor />
          </Form.Item>

            <Form.List
            label="Kích cỡ & Số lượng"
              name="sizes"
              rules={[
                {
                  validator: async (_, sizes) => {
                    if (!sizes || sizes.length < 1) {
                      return Promise.reject(
                        new Error("Phải có ít nhất 1 size")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "size"]}
                        rules={[{ required: true, message: "Chọn size" }]}
                      >
                        <Select placeholder="Size" style={{ width: 120 }}>
                          <Select.Option value="XS">XS</Select.Option>
                          <Select.Option value="S">S</Select.Option>
                          <Select.Option value="M">M</Select.Option>
                          <Select.Option value="L">L</Select.Option>
                          <Select.Option value="XL">XL</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true, message: "Nhập số lượng" }]}
                      >
                        <InputNumber placeholder="Số lượng" min={0} />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <ButtonComponent
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      textButton={"Thêm Size"}
                    />
                      
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>

          <Row gutter={24}>
            <Col xs={12} sm={8}>
              <Form.Item
                label="Hiển thị sản phẩm"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item
                label="Sản phẩm mới?"
                name="isNewProduct"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ảnh chính"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải ảnh chính!" }]}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <ButtonComponent icon={<UploadOutlined />} textButton={"Tải ảnh chính"} />
            </Upload>
          </Form.Item>

          <Form.Item
            label="Ảnh phụ"
            name="subImage"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture" multiple beforeUpload={() => false}>
              <ButtonComponent icon={<UploadOutlined />} textButton={"Tải ảnh phụ (nhiều ảnh)"} />
            </Upload>
          </Form.Item>

          <div className="form-actions-container">
            <Link to="/system/admin/products">
              <ButtonComponent size="large" textButton={"Hủy"} />
            </Link>
            <ButtonComponent
              type="primary"
              htmlType="submit"
              size="large"
              loading={createMutation.isPending}
              textButton={"Tạo sản phẩm"}
            />

          </div>
        </Form>
      </Card>
    </motion.div>
  );
};

export default AdminAddProductPage;
