import React, { useEffect } from "react";
import { Layout, Row, Col, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Import các component cần thiết
import BottomMarquee from "../../components/sections/BottomMarquee/BottomMarquee";
import ProductsComponent from "../../components/Products/ProductsComponent/ProductsComponent";
import FilterSidebar from "../../components/common/FilterSidebar/FilterSidebar";

// Import các service API
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";

const statuses = [
  { label: "Sản phẩm mới", value: "new-arrival" }, // Dùng slug-case cho an toàn
  { label: "Đang giảm giá", value: "on-sale" },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. ĐỌC TẤT CẢ TRẠNG THÁI TỪ URL, ĐÂY LÀ "NGUỒN CHÂN LÝ DUY NHẤT"
  const params = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 8, // Giữ nguyên pageSize ban đầu của bạn
    priceRange: searchParams.get("priceRange")?.split(",").map(Number) || [
      0, 5000000,
    ],
    category: searchParams.get("category")?.split(",") || [],
    sizes: searchParams.get("sizes")?.split(",") || [],
    sortOption: searchParams.get("sortOption") || "default",
    viewMode: searchParams.get("viewMode") || "card",
    status: searchParams.get("status")?.split(",") || [],
    search: searchParams.get("search") || "",
    isActive: true
  };

  // 2. XÓA BỎ TOÀN BỘ useState và hàm filterAndPaginateProducts() CŨ

  // Luôn cuộn lên đầu khi chuyển trang phân trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.page,
      params.category, // Dùng .toString() để có một giá trị ổn định
      params.sizes, 
      params.sortOption, 
      params.priceRange, 
      params.status]);

  // Lấy danh sách danh mục cho bộ lọc
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  // Lấy danh sách sản phẩm dựa trên các tham số từ URL
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", params], // queryKey phụ thuộc vào tất cả các tham số
    queryFn: () => ProductService.getAllProducts(params),
    keepPreviousData: true, // Giữ lại dữ liệu cũ khi đang fetch, tránh nháy màn hình
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.pagination?.total || 0;

  // 3. HÀM XỬ LÝ "TẤT CẢ TRONG MỘT" ĐỂ CẬP NHẬT URL
  const handleFilterChange = (filterName, value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      // Nếu có giá trị, set nó, nếu không (mảng rỗng, chuỗi rỗng) thì xóa khỏi URL
      if (value && value.length > 0) {
        newParams.set(filterName, value.toString());
      } else {
        newParams.delete(filterName);
      }
      newParams.set("page", "1"); // Luôn reset về trang 1 khi lọc
      return newParams;
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", String(page));
      newParams.set("limit", String(pageSize));
      return newParams;
    });
  };

  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("viewMode", mode);
      return newParams;
    });
  };

  // Nút xóa bộ lọc
  const clearFilters = () => {
    setSearchParams({
      page: "1",
      limit: String(params.limit),
      viewMode: params.viewMode,
    });
  };

  if (isError) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Layout className="product-page">
      <Layout.Content className="main-content-wrapper">
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={24} md={6} lg={5} xl={4} className="sidebar-col">
            <FilterSidebar
              // 4. TRUYỀN DỮ LIỆU VÀ HÀM XỬ LÝ MỚI
              categories={
                categoriesData?.data?.map((cat) => ({
                  label: cat.name, // Dùng 'name' làm 'label' để hiển thị
                  value: cat.slug, // Dùng 'slug' làm 'value' để lọc
                })) || []
              }
              sizes={["XS", "S", "M", "L", "XL"]}
              sortOptions={[
                { label: "Mặc định", value: "default" },
                { label: "Giá: Tăng dần ↑", value: "price_asc" },
                { label: "Giá: Giảm dần ↓", value: "price_desc" },
                { label: "Tên: A→Z", value: "name_asc" },
                { label: "Tên: Z→A", value: "name_desc" },
              ]}
              priceRange={params.priceRange}
              selectedCategories={params.category}
              selectedSizes={params.sizes}
              sortOption={params.sortOption}
              setPriceRange={(value) => handleFilterChange("priceRange", value)}
              setSelectedCategories={(value) =>
                handleFilterChange("category", value)
              }
              setSelectedSizes={(value) => handleFilterChange("sizes", value)}
              setSortOption={(value) => handleFilterChange("sortOption", value)}
              // Thêm hàm xóa bộ lọc
              onClearFilters={clearFilters}
              statuses={statuses} // Truyền mảng statuses mới
              selectedStatus={params.status} // Truyền giá trị đang được chọn
              setSelectedStatus={(value) => handleFilterChange("status", value)} // Truyền hàm xử lý
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={18}
            lg={19}
            xl={20}
            className="product-list-col"
          >
            {isLoading && !productsData ? ( // Chỉ hiển thị Spin khi tải lần đầu
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "100px",
                }}
              >
                <Spin size="large" />
              </div>
            ) : (
              <ProductsComponent
                products={products}
                viewMode={params.viewMode}
                total={totalProducts}
                currentPage={params.page}
                pageSize={params.limit}
                onPaginationChange={handlePaginationChange}
                setViewMode={setViewMode}
                loading={isLoading} // Thêm prop loading để làm mờ sản phẩm khi lọc
              />
            )}
          </Col>
        </Row>
      </Layout.Content>
      <BottomMarquee />
    </Layout>
  );
};

export default ProductsPage;
