const mongoose = require("mongoose")
const pdfParse = require("pdf-parse")
const { generateInvterviewReport, generateSkillDrillQuestions } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const { isContentAppropriate } = require("../services/moderation.service")

/**
 * @description Generate an interview report based on the candidate's resume, self-description, and job description
 */

async function generateInterviewReportController(req, res){
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF is required" })
    }

    let resumeContent = ""
    try {
      const parser = new pdfParse.PDFParse({ data: req.file.buffer, verbosity: 0 })
      const pdfResult = await parser.getText()
      resumeContent = pdfResult.text || (typeof pdfResult === 'string' ? pdfResult : "")
    } catch (pdfErr) {
      console.error("PDF parse error:", pdfErr.message)
      return res.status(400).json({ message: "Could not read your PDF. Please upload a valid, text-based PDF resume." })
    }
    if (!resumeContent || resumeContent.trim().length < 50) {
      return res.status(400).json({ message: "PDF appears to be empty or image-only. Please upload a text-based PDF resume." })
    }

    const { selfDescription, jobDescription, targetCompany } = req.body
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" })
    }

    // LAYER 2: Pre-check moderation — fast Gemini call before the expensive GPT-4o-mini call
    const combinedText = `${resumeContent}\n${selfDescription || ""}\n${jobDescription}`
    const moderation = await isContentAppropriate(combinedText, "resume and job application")
    if (!moderation.appropriate) {
      return res.status(400).json({
        message: "Your submission contains inappropriate or unrelated content and cannot be processed. Please ensure your resume, self-description, and job description are genuine and professional.",
      })
    }

    const interviewReportByAi = await generateInvterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
      targetCompany
    })

    // LAYER 1: Prompt-level guardrail — AI itself detected bad input
    if (interviewReportByAi.title === "INVALID_INPUT") {
      return res.status(400).json({
        message: "Your submission couldn’t be processed — please make sure your resume, self-description, and job description are genuine and professional."
      })
    }

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      targetCompany,
      title: interviewReportByAi.title || targetCompany || "Interview Report",
      ...interviewReportByAi
    })

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport
    })
  } catch (error) {
    console.error("Generate report controller error:", error)
    res.status(500).json({ message: "Failed to generate interview report", error: error.message })
  }
}


async function getInterviewReportByIdController(req, res){
  try {
    const {interviewId} = req.params

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview ID format" })
    }

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id }) 
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" })
    }
    res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport 
    })
  } catch (error) {
    console.error("Get interview report controller error:", error)
    res.status(500).json({ message: "Failed to fetch interview report", error: error.message })
  }
}

async function getAllInterviewReportsController(req, res){
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const totalCount = await interviewReportModel.countDocuments({ user: req.user.id })
    const interviewReports = await interviewReportModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-resume -selfDescription -jobDescription -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

    res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview reports", error: error.message });
  }
}

const answerEvaluationModel = require("../models/answerEvaluation.model");

async function getInterviewStatsController(req, res) {
  try {
    const userId = req.user.id;

    // Fetch all reports
    const reports = await interviewReportModel.find({ user: userId }).sort({ createdAt: 1 });

    // Fetch all evaluations
    const evaluations = await answerEvaluationModel.find({ user: userId });

    // Calculate overall stats
    const totalInterviews = reports.length;
    const totalEvaluatedAnswers = evaluations.length;

    let averageEvaluationScore = 0;
    if (totalEvaluatedAnswers > 0) {
      const sum = evaluations.reduce((acc, curr) => acc + curr.score, 0);
      averageEvaluationScore = Math.round(sum / totalEvaluatedAnswers);
    }

    // Map data for progression chart
    const chartData = reports.map((rep) => {
      const repEvals = evaluations.filter((ev) => ev.interviewReport.toString() === rep._id.toString());
      let avgEvalScore = 0;
      if (repEvals.length > 0) {
        const sum = repEvals.reduce((acc, curr) => acc + curr.score, 0);
        avgEvalScore = Math.round(sum / repEvals.length);
      }

      return {
        _id: rep._id,
        role: rep.title || rep.role || "Software Engineer",
        fitScore: rep.matchScore || 0,
        averageEvaluationScore: avgEvalScore,
        createdAt: rep.createdAt,
      };
    });

    res.status(200).json({
      totalInterviews,
      totalEvaluatedAnswers,
      averageEvaluationScore,
      chartData,
    });
  } catch (error) {
    console.error("Stats controller error:", error);
    res.status(500).json({ message: "Failed to aggregate stats", error: error.message });
  }
}

async function generateSkillDrillController(req, res) {
  try {
    const { interviewId, skillIndex } = req.params;
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview ID format" });
    }

    const idx = parseInt(skillIndex, 10);
    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({ message: "Invalid skill index" });
    }

    const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    const skillObj = report.skillGaps[idx];
    if (!skillObj) {
      return res.status(404).json({ message: "Skill gap not found at specified index" });
    }

    const drillData = await generateSkillDrillQuestions({
      skill: skillObj.skill,
      jobDescription: report.jobDescription,
      questionType: "technical"
    });

    res.status(200).json({
      message: "Skill drill questions generated successfully",
      skill: skillObj.skill,
      questions: drillData.questions
    });
  } catch (error) {
    console.error("Generate skill drill error:", error);
    res.status(500).json({ message: "Failed to generate skill drill questions", error: error.message });
  }
}

module.exports = { 
  generateInterviewReportController, 
  getInterviewReportByIdController, 
  getAllInterviewReportsController,
  getInterviewStatsController,
  generateSkillDrillController
}