const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, phone } = newUser;

    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        resolve({ status: "ERR", message: "Email already exists" });
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

      const access_token = await generalAccessToken({ id: checkUser._id, isAdmin: checkUser.isAdmin });
      const refresh_token = await generalRefreshToken({ id: checkUser._id, isAdmin: checkUser.isAdmin });
      // console.log(access_token);
      resolve({
        status: "OK",
        message: "Login successfully",
        data: checkUser,
        access_token,
        refresh_token,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
};
