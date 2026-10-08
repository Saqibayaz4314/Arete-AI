const express = require("express")
const adminRouter = express.Router()
const { getActivityLogs, getLogsSummary } = require("../controllers/admin.controller")

// Simple secret-key guard — pass ?secret=YOUR_ADMIN_KEY in the URL
function adminGuard(req, res, next) {
  const secret = req.query.secret || req.headers["x-admin-secret"]
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid admin secret" })
  }
  next()
}

/**
 * @route GET /api/admin/logs?secret=KEY&page=1&limit=50&action=LOGIN&email=xxx
 */
adminRouter.get("/logs", adminGuard, getActivityLogs)

/**
 * @route GET /api/admin/logs/summary?secret=KEY
 */
adminRouter.get("/logs/summary", adminGuard, getLogsSummary)

module.exports = adminRouter
