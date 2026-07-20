const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller") 
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

// ⚠️ Static routes MUST come before parameterized routes (:interviewId)
// otherwise Express matches "stats" as interviewId in /report/:interviewId

/** POST /api/interview — Generate interview report */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController)

/** GET /api/interview/stats/overview — Stats (must be BEFORE /:interviewId routes) */
interviewRouter.get("/stats/overview", authMiddleware.authUser, interviewController.getInterviewStatsController)

/** GET /api/interview — Get all reports (paginated) */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/** GET /api/interview/report/:interviewId — Get single report */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/** POST /api/interview/:interviewId/drill/:skillIndex — Generate skill drill */
interviewRouter.post("/:interviewId/drill/:skillIndex", authMiddleware.authUser, interviewController.generateSkillDrillController)

module.exports = interviewRouter