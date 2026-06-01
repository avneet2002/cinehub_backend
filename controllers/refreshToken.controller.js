const verifyRefreshToken = require("../utils/verifyRefreshToken");
const { refreshTokenBodyValidation } = require("../utils/validationSchema");
const jwt = require("jsonwebtoken");
const UserToken = require("../models/userToken.model");

const newToken = async (req, res) => {
  const { error } = refreshTokenBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const { tokenDetails } = await verifyRefreshToken(req.body.refreshToken);

    const payload = { _id: tokenDetails.userId };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {
      expiresIn: "15m",
    });

    res.status(200).json({
      error: false,
      accessToken,
      message: "Access token created successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message || "Failed to verify refresh token",
    });
  }
};

const logout = async (req, res) => {
  const { error } = refreshTokenBodyValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  try {
    const userToken = await UserToken.findOne({ token: req.body.refreshToken });

    if (!userToken) {
      return res
        .status(200)
        .json({ error: false, message: "Logged Out Successfully" });
    }

    await UserToken.deleteOne({ token: req.body.refreshToken });

    res.status(200).json({ error: false, message: "Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { newToken, logout };
