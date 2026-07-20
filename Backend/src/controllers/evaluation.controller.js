const mongoose = require("mongoose");
const interviewReportModel = require("../models/interviewReport.model");
const answerEvaluationModel = require("../models/answerEvaluation.model");
const { evaluateAnswer } = require("../services/evaluation.service");
const { isContentAppropriate } = require("../services/moderation.service");

async function evaluateQuestionAnswerController(req, res) {
  const { interviewId, questionType, questionIndex } = req.params;
  const { userAnswer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    return res.status(400).json({ message: "Invalid interview ID format" });
  }

  if (!userAnswer || !userAnswer.trim()) {
    return res.status(400).json({ message: "Answer content is required" });
  }

  if (questionType !== "technical" && questionType !== "behavioral") {
    return res.status(400).json({ message: "Invalid question type. Must be 'technical' or 'behavioral'" });
  }

  const idx = parseInt(questionIndex, 10);
  if (isNaN(idx)) {
    return res.status(400).json({ message: "Invalid question index" });
  }

  try {
    // 1. Fetch interview report and verify ownership
    const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    // 2. Extract specific question & intention
    let questionData;
    if (questionType === "technical") {
      questionData = report.technicalQuestions[idx];
    } else {
      questionData = report.behavioralQuestions[idx];
    }

    if (!questionData) {
      return res.status(404).json({ message: "Question not found at specified index" });
    }

    // 3. Pre-check moderation — fast Gemini call before the expensive evaluation call
    const moderation = await isContentAppropriate(userAnswer, "interview answer")
    if (!moderation.appropriate) {
      return res.status(400).json({
        message: "This response couldn't be evaluated — please provide a genuine, relevant answer to the question.",
      })
    }

    // 4. Call AI evaluation service
    const evaluationResult = await evaluateAnswer({
      question: questionData.question,
      intention: questionData.intention,
      questionType,
      userAnswer,
    });

    // 4. Save/Update answer evaluation record
    // If user already evaluated this question for this report, we overwrite it or create a new one.
    // Let's upsert to prevent cluttering the database for repeated practice of the same question.
    const evaluationDoc = await answerEvaluationModel.findOneAndUpdate(
      {
        user: req.user.id,
        interviewReport: interviewId,
        questionType,
        questionIndex: idx,
      },
      {
        user: req.user.id,
        interviewReport: interviewId,
        questionType,
        questionIndex: idx,
        userAnswer,
        ...evaluationResult,
      },
      {
        returnDocument: 'after',
        upsert: true,
      });

    res.status(200).json({
      message: "Answer evaluated successfully",
      evaluation: evaluationDoc,
    });
  } catch (error) {
    console.error("Evaluation controller error:", error);
    res.status(500).json({ message: "Failed to evaluate answer", error: error.message });
  }
}

async function getEvaluationsByInterviewController(req, res) {
  const { interviewId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(interviewId)) {
    return res.status(400).json({ message: "Invalid interview ID format" });
  }

  try {
    const evaluations = await answerEvaluationModel.find({
      user: req.user.id,
      interviewReport: interviewId,
    });
    res.status(200).json({ evaluations });
  } catch (error) {
    console.error("Fetch evaluations error:", error);
    res.status(500).json({ message: "Failed to fetch evaluations", error: error.message });
  }
}

async function evaluateDrillAnswerController(req, res) {
  const { question, intention, userAnswer, skill } = req.body;

  if (!userAnswer || !userAnswer.trim()) {
    return res.status(400).json({ message: "Answer content is required" });
  }

  if (!question || !question.trim()) {
    return res.status(400).json({ message: "Question content is required" });
  }

  try {
    const moderation = await isContentAppropriate(userAnswer, "interview answer");
    if (!moderation.appropriate) {
      return res.status(400).json({
        message: "Your answer contains inappropriate or unrelated content.",
      });
    }

    const evaluation = await evaluateAnswer({
      question,
      intention: intention || `Assessing skill: ${skill || 'Technical'}`,
      questionType: "technical",
      userAnswer,
    });

    res.status(200).json({
      message: "Drill answer evaluated successfully",
      evaluation,
      skill,
    });
  } catch (error) {
    console.error("Evaluate drill answer error:", error);
    res.status(500).json({ message: "Failed to evaluate drill answer", error: error.message });
  }
}

module.exports = { 
  evaluateQuestionAnswerController, 
  getEvaluationsByInterviewController,
  evaluateDrillAnswerController
};
