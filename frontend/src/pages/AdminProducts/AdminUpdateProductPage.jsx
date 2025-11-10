import { useEffect } from "react";
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
  Spin,
} from "antd";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";
import RichTextEditor from "../../components/common/RichTextEditor/RichTextEditor";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMessageApi } from "../../context/MessageContext";

const AdminUpdateProductPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const queryClient = useQueryClient();

  const { messageApi } = useMessageApi();

  // 1. DÙNG useQuery ĐỂ FETCH DỮ LIỆU SẢN PHẨM CẦN SỬA
  const { data: productDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => ProductService.getDetailProduct(productId),
    enabled: !!productId,
  });

  // DÙNG useQuery ĐỂ LẤY DANH SÁCH CATEGORY
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  // 2. DÙNG useEffect ĐỂ TỰ ĐỘNG ĐIỀN DỮ LIỆU VÀO FORM KHI CÓ
  useEffect(() => {
    if (productDetails?.data) {
      const product = productDetails.data;
      form.setFieldsValue({
        name: product.name,
        category: product.category?._id,
        price: product.price,
        discount: product.discount,
        description: product.description,
        sizes: product.sizes,
        isActive: product.isActive,
        isNewProduct: product.isNewProduct,
        // Chuyển đổi URL ảnh thành định dạng antd <Upload> cần
        image: product.image
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: product.image,
              },
            ]
          : [],
        subImage:
          product.subImage?.map((url, index) => ({
            uid: `-${index + 2}`,
            name: `subimage-${index}.png`,
            status: "done",
            url,
          })) || [],
      });
    }
  }, [productDetails, form]);

  const updateMutation = useMutation({
    mutationFn: (data) =>
      ProductService.updateProduct(productId, data.formData),
    onSuccess: () => {
      messageApi.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }); // Làm mới danh sách sản phẩm
      navigate("/system/admin/products");
    },
    onError: (error) => {
      // "Mở thùng" error ra để đọc đúng message từ BE
      const errorMessage = error.response?.data?.message || error.message;
      messageApi.error(errorMessage); // Dùng hàm từ hook
    },
  });

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = (values) => {
    const formData = new FormData();

    // Xử lý ảnh cũ và mới
    const retainedSubImages = [];
    if (values.image && values.image[0]?.originFileObj) {
      formData.append("image", values.image[0].originFileObj);
    }
    if (values.subImage) {
      values.subImage.forEach((file) => {
        if (file.originFileObj) {
          formData.append("subImage", file.originFileObj);
        } else if (file.url) {
          retainedSubImages.push(file.url);
        }
      });
    }
    formData.append("retainedSubImages", JSON.stringify(retainedSubImages));

    // Xử lý các trường dữ liệu còn lại
    Object.keys(values).forEach((key) => {
      // Bỏ qua các trường ảnh vì đã xử lý riêng
      if (key !== "image" && key !== "subImage") {
        if (key === "sizes" && values[key]) {
          formData.append(key, JSON.stringify(values[key]));
        }
        // Các trường còn lại
        else if (
          key !== "sizes" &&
          values[key] !== undefined &&
          values[key] !== null
        ) {
          formData.append(key, values[key]);
        }
      }
    });

    updateMutation.mutate({ formData });
  };

  if (isLoadingDetails) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="admin-page-header">
          <h1>Chỉnh sửa Sản phẩm</h1>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ sizes: [{ size: "", quantity: 0 }] }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên Sản phẩm"
                name="name"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  loading={isLoadingCategories}
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
              <Form.Item label="Giá" name="price" rules={[{ required: true }]}>
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Giảm giá (%)" name="discount">
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
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
                    return Promise.reject(new Error("Phải có ít nhất 1 size"));
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
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "size"]}
                      rules={[
                        { required: true, message: "Vui lòng chọn size!" },
                      ]}
                    >
                      <Select
                        placeholder="Size"
                        style={{ width: 120 }}
                        options={[
                          { value: "XS" },
                          { value: "S" },
                          { value: "M" },
                          { value: "L" },
                          { value: "XL" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số lượng!",
                        },
                      ]}
                    >
                      <InputNumber placeholder="Số lượng" min={0} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm Size
                  </Button>
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
            rules={[{ required: true }]}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Thay đổi ảnh chính</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Ảnh phụ"
            name="subImage"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture" multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Thay đổi/Thêm ảnh phụ</Button>
            </Upload>
          </Form.Item>
          <div className="form-actions-container">
            <Link to="/system/admin/products">
              <Button size="large">Hủy</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </motion.div>
  );
};

export default AdminUpdateProductPage;
