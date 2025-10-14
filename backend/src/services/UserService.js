const User = require("../models/UserModel");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, confirmPassword, phone } = newUser;

    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        resolve({ status: "ERR", message: "Email already exists" });
      }
      const createUser = await User.create({
        username,
        email,
        phone,
        password,
        confirmPassword,
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

module.exports = {
  createUser,
};
