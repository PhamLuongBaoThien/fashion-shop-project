import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as ProductService from '../../services/ProductService';
import ProductDetail from '../../components/Products/ProductDetail/ProductDetail';
import BottomMarquee from "../../components/sections/BottomMarquee/BottomMarquee";
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import { Spin, Alert } from 'antd'; // Import Spin và Alert
const ProductDetailPage = () => {

  const { slug } = useParams();

  // Gọi API để lấy chi tiết sản phẩm bằng slug
  const { data: productDetails, isLoading, isError, error } = useQuery({
        // queryKey phải bao gồm cả slug để nó fetch lại khi slug thay đổi
        queryKey: ['product-details', slug], 
        queryFn: () => ProductService.getDetailProductBySlug(slug),
        enabled: !!slug, // Chỉ chạy query khi có slug
        // retry: 0 // Không thử lại nếu gặp lỗi
        retry: (failureCount, error) => {
            // 1. Nếu lỗi là 'NotFoundError' (do chúng ta tự ném ra)
            if (error.name === 'NotFoundError') {
                return false; // Không thử lại
            }
            // 2. Đối với tất cả các lỗi khác (lỗi mạng,...)
            // Thử lại tối đa 2 lần (tổng cộng 3 lần chạy)
            if (failureCount < 2) {
                return true; // Thử lại
            }
            // 3. Nếu đã thử 2 lần mà vẫn lỗi, thì dừng lại
            return false;
        }
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingTop: '80px' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Nếu isError là true (vì service đã "throw new Error")
    if (isError) {
        // Hiển thị luôn component 404
        return <NotFoundPage /> 
    }

  return (
    <>
      <ProductDetail product={productDetails?.data}/>
      <BottomMarquee />
    </>
  );
};

export default ProductDetailPage;
