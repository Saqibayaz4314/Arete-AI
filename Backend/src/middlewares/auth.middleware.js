const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "Token not provided" })
  }

  // Check token blacklist — fail-open if DB is temporarily unavailable
  try {
    const isTokenBlackListed = await tokenBlackListModel.findOne({ token })
    if (isTokenBlackListed) {
      return res.status(401).json({ message: "Token is invalid (logged out)" })
    }
  } catch (dbErr) {
    // DB temporarily unavailable — skip blacklist check, let JWT verify proceed
    console.warn("[Auth] Blacklist DB check failed (skipping):", dbErr.message)
  }

  // Verify JWT signature
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = { authUser }