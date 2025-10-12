import React from "react";
import { Pagination } from "antd";
import "./PaginationComponent.css";

const PaginationComponent = ({
  currentPage,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = true,
  pageSizeOptions = ["6", "8", "12", "24"],
  responsive = true,
  showTotal = (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
}) => {
  return (
    <div className="pagination-container">
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        pageSizeOptions={pageSizeOptions}
        responsive={responsive}
        showTotal={showTotal}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default PaginationComponent;
