const ActivityLog = require("../models/activityLog.model")

/**
 * GET /api/admin/logs
 * Query params:
 *   page     (default 1)
 *   limit    (default 50)
 *   action   filter by action e.g. LOGIN, REGISTER, GENERATE_REPORT
 *   email    filter by email (partial match)
 *   status   filter by status: success | failed
 */
async function getActivityLogs(req, res) {
  try {
    const page   = parseInt(req.query.page)   || 1
    const limit  = parseInt(req.query.limit)  || 50
    const skip   = (page - 1) * limit

    const filter = {}
    if (req.query.action) filter.action = req.query.action.toUpperCase()
    if (req.query.status) filter.status = req.query.status
    if (req.query.email)  filter.email  = { $regex: req.query.email, $options: "i" }

    const total = await ActivityLog.countDocuments(filter)
    const logs  = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username email")

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      logs
    })
  } catch (error) {
    console.error("Admin logs error:", error)
    res.status(500).json({ message: "Failed to fetch logs", error: error.message })
  }
}

/**
 * GET /api/admin/logs/summary
 * Returns counts grouped by action
 */
async function getLogsSummary(req, res) {
  try {
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: { action: "$action", status: "$status" },
          count: { $sum: 1 },
          lastActivity: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Unique users count
    const uniqueUsers = await ActivityLog.distinct("user", { user: { $ne: null } })

    // Recent logins
    const recentLogins = await ActivityLog.find({ action: "LOGIN", status: "success" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("username email ip createdAt")

    res.status(200).json({ summary, totalUniqueUsers: uniqueUsers.length, recentLogins })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary", error: error.message })
  }
}

module.exports = { getActivityLogs, getLogsSummary }
