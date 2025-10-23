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
};
