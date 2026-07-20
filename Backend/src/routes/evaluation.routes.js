const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const evaluationController = require("../controllers/evaluation.controller");

const evaluationRouter = express.Router();

/**
 * @route POST /api/evaluation/:interviewId/:questionType/:questionIndex
 * @description Submit candidate answer and get real-time AI grading and feedback
 * @access private
 */
evaluationRouter.post(
  "/:interviewId/:questionType/:questionIndex",
  authMiddleware.authUser,
  evaluationController.evaluateQuestionAnswerController
);

/**
 * @route GET /api/evaluation/:interviewId
 * @description Fetch all saved evaluations for an interview report
 * @access private
 */
evaluationRouter.get(
  "/:interviewId",
  authMiddleware.authUser,
  evaluationController.getEvaluationsByInterviewController
);

/**
 * @route POST /api/evaluation/drill
 * @description Submit skill drill answer and get real-time AI evaluation
 * @access private
 */
evaluationRouter.post(
  "/drill",
  authMiddleware.authUser,
  evaluationController.evaluateDrillAnswerController
);

module.exports = evaluationRouter;
