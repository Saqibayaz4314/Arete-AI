const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const rateLimit = require("express-rate-limit")


const app = express()


app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://arete-ai.duckdns.org",
  "https://arete-ai.duckdns.org",
  "http://159.223.112.70",
  "https://159.223.112.70",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.duckdns.org')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}))

// Rate limiter for AI-calling routes — allows up to 120 AI operations per hour per IP
const aiCallLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI request limit reached. Please wait a few minutes before trying again." }
})

/* require all the routes here */
const authRouter = require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')
const evaluationRouter = require('./routes/evaluation.routes')

/* using all the routes here */ 
app.use("/api/auth", authRouter)
app.use("/api/interview", aiCallLimiter, interviewRouter)
app.use("/api/evaluation", aiCallLimiter, evaluationRouter)

module.exports = app