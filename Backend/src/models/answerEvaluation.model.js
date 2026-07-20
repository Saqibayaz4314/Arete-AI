const mongoose = require("mongoose");

const answerEvaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewReport",
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["technical", "behavioral"],
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    clarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    structureScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    depthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strengths: [
      {
        type: String,
      },
    ],
    improvements: [
      {
        type: String,
      },
    ],
    missingPoints: [
      {
        type: String,
      },
    ],
    rewrittenExample: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const answerEvaluationModel = mongoose.model(
  "AnswerEvaluation",
  answerEvaluationSchema
);

module.exports = answerEvaluationModel;
