import React from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const BreadcrumbComponent = () => {
  const location = useLocation();
  
  // 1. ĐỊNH NGHĨA TỪ ĐIỂN (Map URL -> Tên hiển thị)
  const breadcrumbNameMap = {
    "/": "Trang chủ",
    "/products": "Sản phẩm",
    "/product": "Sản phẩm", 
    "/cart": "Giỏ hàng",
    "/checkout": "Thanh toán",
    "/order-success": "Đặt hàng thành công",
    "/profile": "Thông tin cá nhân",
    "/my-orders": "Đơn hàng của tôi",
    "/sign-in": "Đăng nhập",
    "/sign-up": "Đăng ký",
    "/system/admin": "Quản trị",
    
    // --- CÁC TRANG CON ---
    "/my-order-details": "Chi tiết đơn hàng", 
    "/edit-profile": "Chỉnh sửa thông tin cá nhân", // Tên hiển thị cuối cùng
  };

  // 2. Xử lý logic chèn bước đệm (Thủ thuật)
  // Mặc định lấy path từ URL
  let pathSnippets = location.pathname.split("/").filter((i) => i);

  // --- LOGIC CHÈN BƯỚC ĐỆM CHO EDIT PROFILE ---
  // Nếu đang ở trang /edit-profile, ta giả vờ như đường dẫn là /profile/edit-profile
  // để breadcrumb hiện ra: Trang chủ > Thông tin cá nhân > Chỉnh sửa...
  if (location.pathname === "/edit-profile") {
      // Chèn 'profile' vào trước 'edit-profile'
      pathSnippets = ['profile', 'edit-profile'];
  }
  // ---------------------------------------------

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> Trang chủ
        </Link>
      ),
    },
    ...pathSnippets.map((_, index) => {
      // Tạo URL thực tế cho từng bước
      // Lưu ý: Nếu là bước đệm do mình tự chèn (ví dụ 'profile' ở trên),
      // thì url phải đúng là '/profile'
      let url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      
      // Fix lại URL cho trường hợp đặc biệt (bước đệm)
      if (pathSnippets[index] === 'profile' && location.pathname === "/edit-profile") {
          url = '/profile';
      }
      // Fix lại URL cho trang edit-profile thực tế (vì url ghép ở trên sẽ ra /profile/edit-profile - sai)
      if (pathSnippets[index] === 'edit-profile') {
          url = '/edit-profile';
      }
      
      // Lấy tên hiển thị từ map
      let name = breadcrumbNameMap[url];
      
      // XỬ LÝ LINK ĐÍCH (ĐIỀU HƯỚNG LẠI NẾU CẦN)
      let targetLink = url;
      
      // Nếu click vào "Sản phẩm" (số ít) -> Về danh sách
      if (url === '/product') targetLink = '/products';

      // Nếu click vào "Chi tiết đơn hàng" -> Về Profile
      if (url === '/my-order-details') targetLink = '/profile';

      // XỬ LÝ TÊN CHO CÁC TRANG ĐỘNG
      if (!name) {
        const parentPath = pathSnippets[index - 1];
        
        if (parentPath === 'product') {
             if (location.state && location.state.productName) {
                 name = location.state.productName;
             } else {
                 name = pathSnippets[index].replace(/-/g, ' ');
                 name = name.charAt(0).toUpperCase() + name.slice(1);
             }
        } 
        else if (parentPath === 'my-order-details') {
             name = `#${pathSnippets[index].slice(-6).toUpperCase()}`;
        }
        else {
             name = pathSnippets[index].replace(/-/g, ' ');
             name = name.charAt(0).toUpperCase() + name.slice(1);
        }
      }

      return {
        title: (
            // Nếu là item cuối cùng: Không có link
            index === pathSnippets.length - 1 ? (
                <span>{name}</span>
            ) : (
                <Link to={targetLink}>{name}</Link>
            )
        ),
      };
    }),
  ];

  if (location.pathname === "/") return null;

  return (
    <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "16px 20px 0", 
        backgroundColor: "#fafafa" 
    }}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default BreadcrumbComponent;