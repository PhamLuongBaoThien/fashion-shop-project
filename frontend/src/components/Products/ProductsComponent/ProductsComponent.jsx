import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Empty, Segmented } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import CardComponent from "../../common/CardComponent/CardComponent";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import PaginationComponent from "../../common/PaginationComponent/PaginationComponent";
import ListComponent from "../../common/ListComponent/ListComponent";

import { motion, AnimatePresence } from "framer-motion";
import "./ProductsComponent.css";

import ImgProductA1 from "../../../assets/images/imgProducts/a1.jpg";
import ImgProductA2 from "../../../assets/images/imgProducts/a2.jpeg";
import ImgProductB1 from "../../../assets/images/imgProducts/b1.jpg";
import ImgProductB2 from "../../../assets/images/imgProducts/b2.jpeg";
import ImgProductC1 from "../../../assets/images/imgProducts/c1.jpeg";
import ImgProductC2 from "../../../assets/images/imgProducts/c2.jpeg";
import ImgProductD1 from "../../../assets/images/imgProducts/d1.jpeg";
import ImgProductD2 from "../../../assets/images/imgProducts/d2.jpeg";

// ... (các import hình ảnh và products giữ nguyên)

const { Content } = Layout;

// Cập nhật categories với value (tiếng Anh) và label (tiếng Việt)
const categories = ["Áo", "Áo khoác", "Quần", "Đầm"];
const sizes = ["XS", "S", "M", "L", "XL"];
const statuses = [
  { label: "Mặc định", value: "default" },
  { label: "Còn hàng", value: "available" },
  { label: "Hết hàng", value: "soldout" },
];

const badges = ["New", "Sale"];

const sortOptions = [
  { label: "Mặc định", value: "default" },
  { label: "Giá: Tăng dần ↑", value: "price-asc" },
  { label: "Giá: Giảm dần ↓", value: "price-desc" },
  { label: "Tên: A→Z", value: "name-asc" },
  { label: "Tên: Z→A", value: "name-desc" },
];

const ProductsComponent = () => {
  // const [priceRange, setPriceRange] = useState([0, 4000000]);
  // const [selectedCategories, setSelectedCategories] = useState([]);
  // const [selectedSizes, setSelectedSizes] = useState([]);
  // const [selectedStatus, setSelectedStatus] = useState("default");
  // const [selectedBadges, setSelectedBadges] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [pageSize, setPageSize] = useState(8); // Default page size
  // const [sortOption, setSortOption] = useState("default");
  // const [viewMode, setViewMode] = useState("card"); // 'card' hoặc 'list'

  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo state từ query parameters
  const [priceRange, setPriceRange] = useState(() => {
    const min = parseInt(searchParams.get("minPrice")) || 0;
    const max = parseInt(searchParams.get("maxPrice")) || 4000000;
    return [min, max];
  });
  const [selectedCategories, setSelectedCategories] = useState(() => {
    return searchParams.get("categories")?.split(",")?.filter(Boolean) || [];
  });
  const [selectedSizes, setSelectedSizes] = useState(() => {
    return searchParams.get("sizes")?.split(",")?.filter(Boolean) || [];
  });
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return searchParams.get("status") || "default";
  });
  const [selectedBadges, setSelectedBadges] = useState(() => {
    return searchParams.get("badges")?.split(",")?.filter(Boolean) || [];
  });
  const [sortOption, setSortOption] = useState(() => {
    return searchParams.get("sort") || "default";
  });
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get("view") || "card";
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(searchParams.get("page")) || 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    return parseInt(searchParams.get("pageSize")) || 8;
  });

  // Cập nhật URL khi state thay đổi
  useEffect(() => {
    const params = {};
    if (priceRange[0] !== 0) params.minPrice = priceRange[0];
    if (priceRange[1] !== 4000000) params.maxPrice = priceRange[1];
    if (selectedCategories.length > 0)
      params.categories = selectedCategories.join(",");
    if (selectedSizes.length > 0) params.sizes = selectedSizes.join(",");
    if (selectedStatus !== "default") params.status = selectedStatus;
    if (selectedBadges.length > 0) params.badges = selectedBadges.join(",");
    if (sortOption !== "default") params.sort = sortOption;
    if (viewMode !== "card") params.view = viewMode;
    if (currentPage !== 1) params.page = currentPage;
    if (pageSize !== 8) params.pageSize = pageSize;

    setSearchParams(params, { replace: true });
  }, [
    priceRange,
    selectedCategories,
    selectedSizes,
    selectedStatus,
    selectedBadges,
    sortOption,
    viewMode,
    currentPage,
    pageSize,
    setSearchParams,
  ]);
  const products = [
    {
      id: 1,
      name: "Áo sơ mi linen cao cấp",
      category: "Áo",
      price: 1290000,
      discount: 20,
      image: ImgProductA1,
      subImage: [ImgProductA2],
      badge: "Sale",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 12 },
        { size: "M", quantity: 5 },
        { size: "L", quantity: 0 },
        { size: "XL", quantity: 5 },
      ],
    },
    {
      id: 2,
      name: "Váy midi silk premium",
      category: "Đầm",
      price: 2490000,
      discount: 0,
      image: ImgProductB1,
      subImage: [ImgProductB2],
      badge: "New",
      isNew: true,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 8 },
        { size: "M", quantity: 2 },
        { size: "L", quantity: 1 },
      ],
    },
    {
      id: 3,
      name: "Blazer wool cao cấp",
      category: "Áo khoác",
      price: 3290000,
      discount: 15,
      image: ImgProductC1,
      subImage: [ImgProductC2],
      badge: "Sale",
      isNew: false,
      status: "Hết hàng",
      sizes: [
        { size: "M", quantity: 0 },
        { size: "L", quantity: 0 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 4,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 5,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 6,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 7,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 8,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 9,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 10,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 11,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 12,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 13,
      name: "Áo sơ mi linen cao cấp",
      category: "Áo",
      price: 1290000,
      discount: 20,
      image: ImgProductA1,
      subImage: [ImgProductA2],
      badge: "Sale",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 12 },
        { size: "M", quantity: 5 },
        { size: "L", quantity: 0 },
      ],
    },
    {
      id: 14,
      name: "Váy midi silk premium",
      category: "Đầm",
      price: 2490000,
      discount: 0,
      image: ImgProductB1,
      subImage: [ImgProductB2],
      badge: "New",
      isNew: true,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 8 },
        { size: "M", quantity: 2 },
        { size: "L", quantity: 1 },
      ],
    },
    {
      id: 15,
      name: "Blazer wool cao cấp",
      category: "Áo khoác",
      price: 3290000,
      discount: 15,
      image: ImgProductC1,
      subImage: [ImgProductC2],
      badge: "Sale",
      isNew: false,
      status: "Hết hàng",
      sizes: [
        { size: "M", quantity: 0 },
        { size: "L", quantity: 0 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 16,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
    {
      id: 17,
      name: "Quần tây straight fit",
      category: "Quần",
      price: 1890000,
      discount: 0,
      image: ImgProductD1,
      subImage: [ImgProductD2],
      badge: "",
      isNew: false,
      status: "Còn hàng",
      sizes: [
        { size: "S", quantity: 4 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 2 },
        { size: "XL", quantity: 0 },
      ],
    },
  ];

  const filteredProducts = products.filter((p) => {
    const inCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);
    const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const inSize =
      selectedSizes.length === 0 ||
      p.sizes.some((s) => selectedSizes.includes(s.size) && s.quantity > 0);
    const inStatus =
      selectedStatus === "default" ||
      (selectedStatus === "available" && p.status === "Còn hàng") ||
      (selectedStatus === "soldout" && p.status === "Hết hàng");
    const inBadge =
      selectedBadges.length === 0 ||
      (p.badge && selectedBadges.includes(p.badge));
    return inCategory && inPrice && inSize && inStatus && inBadge;
  });

  // Sort products based on sortOption
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "default":
      default:
        return a.id - b.id; // Sort by ID for default order
    }
  });

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters or sort option change
  }, [
    selectedCategories,
    selectedSizes,
    selectedStatus,
    selectedBadges,
    priceRange,
    sortOption,
  ]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handlePaginationChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) setPageSize(newPageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout className="product-page">
      <Content className="main-content-wrapper">
        <Row gutter={[20, 20]}>
          {/* Sidebar - Cột bên trái trên màn hình lớn, chiếm toàn bộ chiều rộng (24) trên màn hình nhỏ */}
          <Col
            xs={24} // Chiếm 24/24 trên Extra Small (di động)
            sm={24} // Chiếm 24/24 trên Small (máy tính bảng đứng)
            md={6} // Chiếm 6/24 trên Medium (máy tính bảng ngang)
            lg={5} // Chiếm 5/24 trên Large (desktop)
            xl={4} // Chiếm 4/24 trên Extra Large
            className="sidebar-col"
          >
            <FilterSidebar
              categories={categories}
              sizes={sizes}
              statuses={statuses}
              badges={badges}
              sortOptions={sortOptions}
              priceRange={priceRange}
              selectedCategories={selectedCategories}
              selectedSizes={selectedSizes}
              selectedStatus={selectedStatus}
              selectedBadges={selectedBadges}
              sortOption={sortOption}
              setPriceRange={setPriceRange}
              setSelectedCategories={setSelectedCategories}
              setSelectedSizes={setSelectedSizes}
              setSelectedStatus={setSelectedStatus}
              setSelectedBadges={setSelectedBadges}
              setSortOption={setSortOption}
            />
          </Col>

          {/* Product List - Cột bên phải trên màn hình lớn, chiếm toàn bộ chiều rộng (24) trên màn hình nhỏ */}

          <Col
            xs={24} // Chiếm 24/24 trên Extra Small
            sm={24} // Chiếm 24/24 trên Small
            md={18} // Chiếm 18/24 trên Medium (24-6)
            lg={19} // Chiếm 19/24 trên Large (24-5)
            xl={20} // Chiếm 20/24 trên Extra Large (24-4)
            className="product-list-col"
          >
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 20 }}
            >
              <h2 className="page-title">Danh sách sản phẩm:</h2>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  {
                    label: "Card",
                    value: "card",
                    icon: <AppstoreOutlined />,
                  },
                  {
                    label: "List",
                    value: "list",
                    icon: <BarsOutlined />,
                  },
                ]}
              />
            </Row>

            {/* PRODUCT LIST */}
            <AnimatePresence mode="wait">
              {viewMode === "card" ? (
                <motion.div
                  key="card-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Row gutter={[20, 20]}>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((item, index) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.05, // delay nhẹ tạo hiệu ứng "stagger"
                            }}
                          >
                            <CardComponent product={item} />
                          </motion.div>
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <Empty
                          description="Không tìm thấy sản phẩm phù hợp"
                          style={{ margin: "50px auto" }}
                        />
                      </Col>
                    )}
                  </Row>
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ListComponent products={paginatedProducts} />
                </motion.div>
              )}
            </AnimatePresence>
            {filteredProducts.length > 0 && (
              <div className="pagination-container">
                <PaginationComponent
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={filteredProducts.length}
                  onChange={handlePaginationChange}
                />
              </div>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProductsComponent;
