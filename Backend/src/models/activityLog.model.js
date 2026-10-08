const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null
  },
  username: { type: String, default: "Guest" },
  email:    { type: String, default: "" },
  action:   { type: String, required: true },  // e.g. LOGIN, REGISTER, GENERATE_REPORT, EVALUATE_ANSWER
  details:  { type: String, default: "" },      // e.g. target company, question type, skill
  ip:       { type: String, default: "" },
  userAgent:{ type: String, default: "" },
  status:   { type: String, enum: ["success", "failed"], default: "success" }
}, { timestamps: true })

module.exports = mongoose.model("activity_logs", activityLogSchema)
