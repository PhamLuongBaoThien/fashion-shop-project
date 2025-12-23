const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const cloudinary = require("../config/cloudinary");
const cookieConfig = require("../config/cookieConfig");

const createUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;

    const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const phoneReg = /^(84|0[3|5|7|8|9])[0-9]{8}$/;

    if (!username || !email || !password || !confirmPassword || !phone) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The input is required" });
    }
    if (!emailReg.test(email)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The email is invalid" });
    }
    if (!phoneReg.test(phone)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The phone is invalid" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The password is not match" });
    }

    const response = await UserService.createUser({
      username,
      email,
      password,
      phone,
    });
    if (response.status === "ERR") {
      return res.status(400).json(response);
    }

    return res.status(201).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The input is required" });
    }
    if (!emailReg.test(email)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The email is invalid" });
    }

    const response = await UserService.loginUser({ email, password });

    if (response.status === "ERR") {
      return res.status(400).json(response); // Trả về lỗi 400 Bad Request
    }

    const { refresh_token, ...newResponse } = response;
    // console.log('refresh_token', refresh_token);
    res.cookie('refresh_token', refresh_token, cookieConfig);
    return res.status(201).json({ status: "OK", data: newResponse });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The userid is required" });
    }

    // BƯỚC 1: TẠO MỘT OBJECT DỮ LIỆU MỚI ĐỂ CHUẨN BỊ
    const updateData = {};

    // BƯỚC 2: TÁI CẤU TRÚC DỮ LIỆU ĐỊA CHỈ
    // Gom các trường địa chỉ vào một object con
    updateData.address = {
      province: data.province,
      district: data.district,
      ward: data.ward,
      detailAddress: data.detailAddress,
    };

    // BƯỚC 3: THÊM CÁC TRƯỜNG CÒN LẠI VÀO updateData
    // Duyệt qua các key trong req.body và thêm vào nếu nó không phải là trường địa chỉ
    Object.keys(data).forEach((key) => {
      if (!["province", "district", "ward", "detailAddress"].includes(key)) {
        updateData[key] = data[key];
      }
    });

    // Kiểm tra xem Multer có xử lý file nào không
    if (req.file) {
      // req.file.buffer chứa dữ liệu nhị phân của ảnh
      const fileBuffer = req.file.buffer;

      // Dùng Promise để upload từ buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "avatars" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });

      updateData.avatar = result.secure_url;
    }

    const response = await UserService.updateUser(userId, updateData);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The userid is required" });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getDetailUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The userid is required" });
    }
    const response = await UserService.getDetailUser(userId);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    // console.log("refresh_token", token);
    if (!token) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The refresh token is required" });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(201).json({ status: "OK", message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The input is required" });
    }
    if (!emailReg.test(email)) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The email is invalid" });
    }

    // Gọi đến một service function mới chỉ dành cho admin
    const response = await UserService.loginAdmin({ email, password });

    // Đoạn code này giống hệt loginUser
    const { refresh_token, ...newResponse } = response;
    res.cookie('refresh_token', refresh_token, cookieConfig);
    return res.status(200).json({ status: "OK", data: newResponse });
  } catch (error) {
    // Khối catch này sẽ bắt lỗi "Không phải admin" hoặc "Sai mật khẩu"
    return res.status(400).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res
        .status(200)
        .json({ status: "ERR", message: "User ID is required" });
    }

    if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
      return res
        .status(200)
        .json({ status: "ERR", message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const response = await UserService.changePassword(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validate cơ bản
    if (!username || !email || !password || !phone) {
      return res.status(200).json({
        status: "ERR",
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    // Validate email
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!reg.test(email)) {
      return res
        .status(200)
        .json({ status: "ERR", message: "Email không hợp lệ" });
    }

    const response = await UserService.createUserByAdmin(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e });
  }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(200).json({ status: 'ERR', message: 'Vui lòng nhập email' });
        }
        const response = await UserService.forgotPassword(email);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ status: 'ERR', message: e.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;
        // token ở đây lấy từ body (FE gửi lên) hoặc params tùy cách bạn xử lý
        
        if (!password || !confirmPassword || !token) {
            return res.status(200).json({ status: 'ERR', message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        if (password !== confirmPassword) {
            return res.status(200).json({ status: 'ERR', message: 'Mật khẩu xác nhận không khớp' });
        }
        
        const response = await UserService.resetPassword(token, password);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ status: 'ERR', message: e.message });
    }
}

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  refreshToken,
  logoutUser,
  loginAdmin,
  changePassword,
  createUserByAdmin,
  forgotPassword,
  resetPassword
};
