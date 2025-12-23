const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generalAccessToken = (payload) => {
  const access_token = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN, {
    expiresIn: "30s",
  });

  return access_token;
};

const generalRefreshToken = (payload) => {
  const access_token = jwt.sign({ ...payload }, process.env.REFRESH_TOKEN, {
    expiresIn: "365d",
  });

  return access_token;
};

const generalResetToken = (payload) => {
  const token = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m", // Token này sống 15 phút
  });
  return token;
};

const verifyResetToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      // Dùng secret key trùng với lúc tạo token
      jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
          return resolve({
            status: "ERR",
            message: "Token hết hạn hoặc không hợp lệ",
          });
        }
        // Nếu đúng thì trả về dữ liệu đã giải mã (chứa id, email...)
        resolve({
          status: "OK",
          decoded,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const refreshTokenJwtService = (token) => {

  return new Promise((resolve, reject) => {
  try {
    jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
      if (err) {
      resolve({ status: "ERR", message: "Invalid token" });
      }
      const access_token = await generalAccessToken({
        id: user?.id,
        isAdmin: user?.isAdmin,
      });

      resolve({
        status: "OK",
        message: "successfully",
        access_token,
      });
    });
  } catch (error) {
    reject(error);
  }
  });
};
module.exports = {
  generalAccessToken,
  generalRefreshToken,
  refreshTokenJwtService,
  verifyResetToken,
  generalResetToken
};
