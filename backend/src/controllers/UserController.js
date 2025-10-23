const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");

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
    const { refresh_token, ...newResponse } = response;
    // console.log('refresh_token', refresh_token);
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true, // Http only: chỉ lấy được cookie bằng giao thức HTTP và không thể lấy bằng JS
      secure: false, // để test local (đặt true khi dùng https)
      // sameSite: "Strict", //sameSite chống tấn công CSRF
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // maxAge: 1 năm
    }); // 1 năm
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
    const response = await UserService.updateUser(userId, data);
    return res.status(201).json({ response });
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
    return res.status(201).json({ response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(201).json({ response });
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
    return res.status(201).json({ response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    console.log("refresh_token", token);
    if (!token) {
      return res
        .status(400)
        .json({ status: "ERR", message: "The refresh token is required" });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(201).json({ response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  refreshToken,
};
