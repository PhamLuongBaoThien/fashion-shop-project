const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generalAccessToken = (payload) => {
  const access_token = jwt.sign({ payload }, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });

  return access_token;
};

const generalRefreshToken = (payload) => {
  const access_token = jwt.sign({ payload }, process.env.REFRESH_TOKEN, {
    expiresIn: "365d",
  });

  return access_token;
};

const refreshTokenJwtService = (token) => {
  return new Promise((resolve, reject) => {
    // console.log("token", token);
    jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
      if (err) {
      resolve({ status: "ERR", message: "Invalid token" });
      }
      const { payload } = user;
      const access_token = await generalAccessToken({
        id: payload?.id,
        isAdmin: payload.isAdmin,
      });
      const refresh_token = await generalRefreshToken({
        id: payload?.id,
        isAdmin: payload.isAdmin,
      });
      resolve({
        status: "OK",
        message: "successfully",
        access_token,
        refresh_token,
      });
    });
  });
};
module.exports = {
  generalAccessToken,
  generalRefreshToken,
  refreshTokenJwtService,
};
