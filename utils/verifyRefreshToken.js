const UserToken = require("../models/userToken.model");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const verifyRefreshToken = async (refreshToken) => {
  const privateKey = process.env.REFRESH_TOKEN;

  try {
    const doc = await UserToken.findOne({ token: refreshToken });
    if (!doc) {
      throw { error: true, message: "Invalid refresh token" };
    }

    const tokenDetails = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, privateKey, (err, decoded) => {
        if (err)
          return reject({ error: true, message: "Invalid refresh token" });

        resolve(decoded);
      });
    });

    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
    };
  } catch (err) {
    throw err;
  }
};

module.exports = verifyRefreshToken;
