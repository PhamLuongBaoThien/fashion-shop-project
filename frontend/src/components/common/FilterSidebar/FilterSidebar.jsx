import React from "react";
import { Collapse } from "antd"; // Loại bỏ Layout, Sider
import { CaretRightOutlined } from "@ant-design/icons";
import FilterItem from "./FilterItem";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import "./FilterSidebar.css";

const FilterSidebar = ({
  // ... (các props giữ nguyên)
  categories,
  sizes,
  statuses,
  sortOptions,
  priceRange,
  selectedCategories,
  selectedSizes,
  selectedStatus,
  sortOption,

  // Các hàm xử lý từ component cha
  setPriceRange,
  setSelectedCategories,
  setSelectedSizes,
  setSelectedStatus,
  setSortOption,
  onClearFilters
}) => {
  return (
    <div className="filter-sidebar">
      <h3 className="filter-title">Bộ lọc sản phẩm</h3>

      <Collapse
        // ... (Collapse props giữ nguyên)
        bordered={false}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            rotate={isActive ? 90 : 0}
            style={{ color: "#555" }}
          />
        )}
        defaultActiveKey={["1"]} // Mở tất cả theo mặc định trên màn hình lớn
        className="filter-collapse"
        items={[
          // ... (các items giữ nguyên)
          {
            key: "1",
            label: "Danh mục",
            children: (
              <FilterItem
                type="checkbox"
                options={categories}
                value={selectedCategories}
                onChange={setSelectedCategories}
              />
            ),
          },
          {
            key: "2",
            label: "Khoảng giá (VNĐ)",
            children: (
              <>
                <FilterItem
                  type="slider"
                  value={priceRange}
                  onChange={setPriceRange}
                  min={0}
                  max={4000000}
                  step={100000}
                />
                {/* <p className="price-range">
                {priceRange[0].toLocaleString()}đ -{" "}
                {priceRange[1].toLocaleString()}đ
              </p> */}
              </>
            ),
          },
          {
            key: "3",
            label: "Kích cỡ",
            children: (
              <FilterItem
                type="checkbox"
                options={sizes}
                value={selectedSizes}
                onChange={setSelectedSizes}
              />
            ),
          },
          {
            key: "4",
            label: "Trạng thái",
            children: (
              <FilterItem
                type="checkbox"
                options={statuses}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
            ),
          },
          {
            key: "5",
            label: "Sắp xếp",
            children: (
              <FilterItem
                type="radio"
                options={sortOptions}
                value={sortOption}
                onChange={setSortOption}
              />
            ),
          },
        ]}
      />

      {/* Nút xóa bộ lọc */}
      <ButtonComponent
        size="small"
        styleButton={{ marginTop: 10, padding: 0 }}
        styleTextButton={{ color: "#1890ff" }}
        textButton="Xóa bộ lọc"
        onClick={onClearFilters}
      />
    </div>
  );
};

export default FilterSidebar;
