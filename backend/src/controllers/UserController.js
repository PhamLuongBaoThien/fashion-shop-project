const UserService = require("../services/UserService");

const createUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;

    const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const phoneReg = /^(84|0[3|5|7|8|9])[0-9]{8}$/;

    if (!username || !email || !password || !confirmPassword || !phone) {
      return res.status(400).json({ status: "ERR", message: "The input is required" });
    }
    if (!emailReg.test(email)) {
      return res.status(400).json({ status: "ERR", message: "The email is invalid" });
    }
    if (!phoneReg.test(phone)) {
      return res.status(400).json({ status: "ERR", message: "The phone is invalid" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: "ERR", message: "The password is not match" });
    }

    const response = await UserService.createUser({ username, email, password, phone });
    return res.status(201).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const loginUser = async (req, res) => {
try {
    const {email, password} = req.body;

    const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    if (!email || !password) {
      return res.status(400).json({ status: "ERR", message: "The input is required" });
    }
    if (!emailReg.test(email)) {
      return res.status(400).json({ status: "ERR", message: "The email is invalid" });
    }

    const response = await UserService.loginUser({email, password});
    return res.status(201).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(400).json({ status: "ERR", message: "The userid is required" });
    }
    const response = await UserService.updateUser(userId, data);
    return res.status(201).json({response});
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ status: "ERR", message: "The userid is required" });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(201).json({response});
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
}


module.exports = { createUser, loginUser, updateUser, deleteUser };
