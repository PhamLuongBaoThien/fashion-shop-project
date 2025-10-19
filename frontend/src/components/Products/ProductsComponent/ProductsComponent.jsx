import React from "react";
import { Row, Col, Empty, Segmented } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import CardComponent from "../../common/CardComponent/CardComponent";
import ListComponent from "../../common/ListComponent/ListComponent";
import PaginationComponent from "../../common/PaginationComponent/PaginationComponent";
import { motion, AnimatePresence } from "framer-motion";
import "./ProductsComponent.css";

const ProductsComponent = ({
  products,
  viewMode,
  total,
  currentPage,
  pageSize,
  onPaginationChange,
  setViewMode,
}) => {
  return (
    <div className="product-list-wrapper">
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <h2 className="page-title">Danh sách sản phẩm:</h2>
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            { label: "Card", value: "card", icon: <AppstoreOutlined /> },
            { label: "List", value: "list", icon: <BarsOutlined /> },
          ]}
        />
      </Row>

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
              {products.length > 0 ? (
                products.map((item, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
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
            <ListComponent products={products} />
          </motion.div>
        )}
      </AnimatePresence>
      {total > 0 && (
        <div className="pagination-container">
          <PaginationComponent
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPaginationChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsComponent;