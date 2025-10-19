import React, { useState, useEffect } from "react";

import BottomMarquee from "../../components/sections/BottomMarquee/BottomMarquee";
import ProductsComponent from "../../components/Products/ProductsComponent/ProductsComponent";
import FilterSidebar from "../../components/common/FilterSidebar/FilterSidebar";
// import CardComponent from "../../components/common/CardComponent/CardComponent";
// import ListComponent from "../../components/common/ListComponent/ListComponent";
// import PaginationComponent from "../../components/common/PaginationComponent/PaginationComponent";
import ImgProductA1 from "../../assets/images/imgProducts/a1.jpg";
import ImgProductA2 from "../../assets/images/imgProducts/a2.jpeg";
import ImgProductB1 from "../../assets/images/imgProducts/b1.jpg";
import ImgProductB2 from "../../assets/images/imgProducts/b2.jpeg";
import ImgProductC1 from "../../assets/images/imgProducts/c1.jpeg";
import ImgProductC2 from "../../assets/images/imgProducts/c2.jpeg";
import ImgProductD1 from "../../assets/images/imgProducts/d1.jpeg";
import ImgProductD2 from "../../assets/images/imgProducts/d2.jpeg";
import { Layout, Row, Col } from "antd";

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

const ProductsPage = () => {
// State quản lý filter và pagination
  const [priceRange, setPriceRange] = useState([0, 4000000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("default");
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Đổi thành 10 để chuẩn bị cho BE
const [viewMode, setViewMode] = useState("card"); // Thêm state cho viewMode
  // Hàm lọc và sắp xếp sản phẩm
  const filterAndPaginateProducts = () => {
    let filteredProducts = [...products];

    // Lọc theo danh mục
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    // Lọc theo khoảng giá
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Lọc theo kích cỡ
    if (selectedSizes.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.size) && s.quantity > 0)
      );
    }

    // Lọc theo trạng thái
    if (selectedStatus !== "default") {
      filteredProducts = filteredProducts.filter((p) => {
        if (selectedStatus === "available") return p.status === "Còn hàng";
        if (selectedStatus === "soldout") return p.status === "Hết hàng";
        return true;
      });
    }

    // Lọc theo badges
    if (selectedBadges.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        selectedBadges.includes(p.badge)
      );
    }

    // Sắp xếp
    filteredProducts.sort((a, b) => {
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
          return a.id - b.id;
      }
    });

    // Phân trang
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      paginatedProducts,
      total: filteredProducts.length,
    };
  };

  // Cập nhật danh sách khi state thay đổi
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [
    priceRange,
    selectedCategories,
    selectedSizes,
    selectedStatus,
    selectedBadges,
    sortOption,
  ]);

  const { paginatedProducts, total } = filterAndPaginateProducts();

  const handlePaginationChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) setPageSize(newPageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout className="product-page">
      <Layout.Content className="main-content-wrapper">
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={24} md={6} lg={5} xl={4} className="sidebar-col">
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
          <Col
            xs={24}
            sm={24}
            md={18}
            lg={19}
            xl={20}
            className="product-list-col"
          >
            <ProductsComponent
             products={paginatedProducts}
              viewMode={viewMode}
              total={total}
              currentPage={currentPage}
              pageSize={pageSize}
              onPaginationChange={handlePaginationChange}
              setViewMode={setViewMode}
            />
          </Col>
        </Row>
      </Layout.Content>
      <BottomMarquee />
    </Layout>
  );
};

export default ProductsPage;
