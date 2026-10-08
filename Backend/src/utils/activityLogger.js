const ActivityLog = require("../models/activityLog.model")

/**
 * Log a user activity to the database (fire-and-forget, never throws)
 */
async function log({ user, username, email, action, details = "", ip = "", userAgent = "", status = "success" }) {
  try {
    await ActivityLog.create({ user, username, email, action, details, ip, userAgent, status })
  } catch (_) {
    // Logging must never crash the server
  }
}

/**
 * Extract real IP from request (handles proxies / Nginx X-Real-IP)
 */
function getIP(req) {
  return (
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  )
}

module.exports = { log, getIP }
