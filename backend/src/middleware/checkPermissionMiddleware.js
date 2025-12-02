const User = require("../models/UserModel");
const Role = require("../models/RoleModel");

const PERMISSION_NAMES = {
    'product': 'Quản lý Sản phẩm',
    'category': 'Quản lý Danh mục',
    'order': 'Quản lý Đơn hàng',
    'user': 'Quản lý Người dùng',
    'system': 'Quản lý Phân quyền hệ thống',
};

const checkPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      if (!userId)
        return res.status(401).json({ status: "ERR", message: "Unauthorized" });

      const user = await User.findById(userId).populate("role");
      if (!user)
        return res
          .status(404)
          .json({ status: "ERR", message: "User not found" });

      // --- LEVEL 1: KIỂM TRA QUYỀN TỐI THƯỢNG (SUPER ADMIN) ---
      // Đây là những người "Miễn tử kim bài", đi đâu cũng được.
      const isSuperAdminEmail = user.email === "plbthien1@gmail.com"; // Email của bạn
      const isSuperAdminRole = user.role?.name === "Super Admin"; // Hoặc dựa vào tên Role

      if (isSuperAdminEmail || isSuperAdminRole) {
        return next(); // Cho qua luôn, không cần check permission lẻ tẻ
      }

      // --- LEVEL 2: KIỂM TRA USER THƯỜNG (NHÂN VIÊN) ---
      if (!user.isAdmin || !user.role) {
        return res
          .status(403)
          .json({ status: "ERR", message: "Không có quyền truy cập" });
      }

      // Check quyền cụ thể trong DB
      // Logic: User có quyền 'system' HOẶC User có ít nhất 1 quyền trong danh sách yêu cầu
      const userPermissions = user.role.permissions || [];

      // Kiểm tra xem có ít nhất 1 quyền trùng khớp không
      const hasRequiredPermission = requiredPermissions.some((p) =>
        userPermissions.includes(p)
      );
      if (hasRequiredPermission) {
        next();
      } else {
        const missingPermissionsText = requiredPermissions
                    .map(p => PERMISSION_NAMES[p] || p) 
                    .join(' hoặc ');

        return res.status(403).json({
          status: "ERR",
          message: `Bạn thiếu quyền truy cập! Yêu cầu quyền: ${missingPermissionsText}`,
        });
      }
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Error checking permission", error: e.message });
    }
  };
};

module.exports = { checkPermission };
