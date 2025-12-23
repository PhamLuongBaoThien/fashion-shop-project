const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken, generalResetToken, verifyResetToken } = require("./JwtService");
const EmailService = require("./EmailService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, phone } = newUser;

    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        return resolve({ status: "ERR", message: "Email already exists" });
      }

      const hash = bcrypt.hashSync(password, 10);

      const createUser = await User.create({
        username,
        email,
        phone,
        password: hash,
      });
      if (createUser) {
        resolve({
          status: "OK",
          message: "User created successfully",
          data: createUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;

    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser === null) {
        resolve({ status: "ERR", message: "Tài khoản không tồn tại." });
      }

      if (checkUser.isBlocked) {
                return resolve({ 
                    status: 'ERR', 
                    message: 'Tài khoản của bạn đã bị khóa.' 
                });
            }

      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        resolve({ status: "ERR", message: "Mật khẩu không chính xác." });
      }

      const access_token = await generalAccessToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });
      const refresh_token = await generalRefreshToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });
      // console.log(access_token);
      resolve({
        status: "OK",
        message: "Login successfully",
        // data: checkUser,
        access_token,
        refresh_token,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);
      // console.log('checkUser', checkUser);

      if (checkUser === null) {
        return resolve({ status: "ERR", message: "The user is not defined" });
      }

      const updateUser = await User.findByIdAndUpdate(id, data, { new: true });
      // console.log("updateUser", updateUser);

      resolve({
        status: "OK",
        message: "successfully",
        data: updateUser
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);

      if (checkUser === null) {
        return resolve({ status: "ERR", message: "The user is not defined" });
      }

      await User.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "successfully",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find().sort({createdAt: -1, updatedAt: -1});
            resolve({
                status: 'OK',
                message: 'Success',
                data: allUser
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);

      if (user === null) {
        resolve({ status: "ERR", message: "The user is not defined" });
      }
      resolve({
        status: "OK",
        message: "successfully",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loginAdmin = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin;
        try {
            // ĐIỀU KIỆN QUAN TRỌNG: Tìm user có email khớp VÀ isAdmin: true
            const checkUser = await User.findOne({ email: email, isAdmin: true });
            
            if (checkUser === null) {
                // Lỗi chung để bảo mật, không cho biết email có tồn tại hay không
                return reject(new Error("Wrong email, password or you are not an admin")); 
            }
            
            const comparePassword = bcrypt.compareSync(password, checkUser.password);
            if (!comparePassword) {
                return reject(new Error("Wrong email, password or you are not an admin"));
            }

            // Nếu thành công, tạo token như bình thường
            const access_token = await generalAccessToken({
                id: checkUser._id,
                isAdmin: checkUser.isAdmin,
            });
            const refresh_token = await generalRefreshToken({
                id: checkUser._id,
                isAdmin: checkUser.isAdmin,
            });
            
            resolve({
                status: "OK",
                message: "Login successfully",
                access_token,
                refresh_token,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const changePassword = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = data;
            
            // 1. Check user tồn tại
            const user = await User.findById(id);
            if (user === null) {
                resolve({ status: 'ERR', message: 'User not found' });
            }

            // 2. Check mật khẩu cũ
            const comparePassword = bcrypt.compareSync(oldPassword, user.password);
            if (!comparePassword) {
                resolve({ status: 'ERR', message: 'Mật khẩu cũ không chính xác' });
                return;
            }

            if (oldPassword === newPassword) {
              resolve({status: 'ERR', message: 'Mật khẩu mới không trùng với mật khẩu cũ'})
              return;
            }

            // 3. Check confirm password (Backend cũng nên check lại)
            if (newPassword !== confirmPassword) {
                resolve({ status: 'ERR', message: 'Mật khẩu xác nhận không khớp' });
                return;
            }

            // 4. Hash mật khẩu mới và lưu
            const hashPassword = bcrypt.hashSync(newPassword, 10);
            user.password = hashPassword;
            await user.save();

            resolve({ status: 'OK', message: 'Đổi mật khẩu thành công' });
        } catch (e) {
            reject(e);
        }
    });
};

const createUserByAdmin = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { username, email, password, phone, isAdmin, role, isBlocked } = newUser;
        try {
            // 1. Check trùng email
            const checkUser = await User.findOne({ email: email });
            if (checkUser !== null) {
                resolve({ status: 'ERR', message: 'Email đã tồn tại' });
                return;
            }

            // 2. Hash password
            const hashPassword = bcrypt.hashSync(password, 10);

            // 3. Tạo user với đầy đủ quyền lực (Admin/Role/Block)
            const createdUser = await User.create({
                username,
                email,
                password: hashPassword,
                phone,
                isAdmin: isAdmin || false,
                role: role || null,
                isBlocked: isBlocked || false
            });

            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'Tạo người dùng thành công',
                    data: createdUser
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

// 1. Quên mật khẩu
const forgotPassword = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                resolve({ status: 'ERR', message: 'Email không tồn tại' });
                return;
            }

            if (user.isAdmin) {
                 resolve({ status: 'ERR', message: 'Tài khoản quản trị không được phép đặt lại mật khẩu qua Email. Vui lòng liên hệ bộ phận kỹ thuật.' });
                 return;
            }

            if (user.isBlocked) {
              resolve({status: 'ERR', message: 'Tài khoản đã bị khóa.'})
            }

            // 2. SỬ DỤNG HÀM CỦA JWT SERVICE 
            const token = generalResetToken({ id: user._id, email: user.email });
            
            const resetLink = `${process.env.FE_URL_LOCAL}/reset-password/${token}`;

            await EmailService.sendEmailResetPassword(email, resetLink);

            resolve({ status: 'OK', message: 'Kiểm tra email của bạn!' });
        } catch (e) {
            reject(e);
        }
    });
};

// 2. Đặt lại mật khẩu mới
const resetPassword = (token, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Gọi service verify thay vì dùng jwt.verify trực tiếp 
      const verifyData = await verifyResetToken(token);

      // Nếu verify thất bại (token lỗi/hết hạn)
      if (verifyData.status === 'ERR') {
         return resolve({
            status: 'ERR',
            message: 'Link đã hết hạn hoặc không hợp lệ'
         });
      }

      // Nếu OK, lấy ID user từ dữ liệu đã giải mã
      const { id } = verifyData.decoded;

      const hashPassword = bcrypt.hashSync(newPassword, 10);
      
      // Cập nhật mật khẩu mới
      const updatedUser = await User.findByIdAndUpdate(
          id, 
          { password: hashPassword }, 
          { new: true }
      );

      if (!updatedUser) {
          return resolve({ status: 'ERR', message: 'User không tồn tại' });
      }

      resolve({ status: 'OK', message: 'Đặt lại mật khẩu thành công' });

    } catch (e) {
      reject(e);
    }
  });
};


module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  loginAdmin,
  changePassword,
  createUserByAdmin,
  forgotPassword,
  resetPassword
};
