const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

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
        resolve({ status: "ERR", message: "The user is not defined" });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        resolve({ status: "ERR", message: "The password is incorrect" });
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
      const allUsers = await User.find();
      resolve({
        status: "OK",
        message: "successfully",
        data: allUsers,
      });
    } catch (error) {
      reject(error);
    }
  });
};

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

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  loginAdmin,
  changePassword
};
