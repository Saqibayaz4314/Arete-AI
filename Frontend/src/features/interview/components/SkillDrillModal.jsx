import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../../../utils/api";

const SkillDrillModal = ({ interviewId, skillIndex, skillName, onClose }) => {
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState("");
  const [evaluations, setEvaluations] = useState({}); // indexed by question index

  useEffect(() => {
    const fetchDrillQuestions = async () => {
      setLoadingQuestions(true);
      setError("");
      try {
        const res = await axios.post(
          `${API_BASE}/api/interview/${interviewId}/drill/${skillIndex}`,
          {},
          { withCredentials: true }
        );
        if (res.data && res.data.questions) {
          setQuestions(res.data.questions);
        } else {
          setError("Failed to load drill questions.");
        }
      } catch (err) {
        console.error("Skill drill fetch error:", err);
        setError(err.response?.data?.message || "Failed to load drill questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (interviewId !== undefined && skillIndex !== undefined) {
      fetchDrillQuestions();
    }
  }, [interviewId, skillIndex]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvaluating(true);
    setEvalError("");
    const currentQ = questions[currentIndex];

    try {
      const res = await axios.post(
        `${API_BASE}/api/evaluation/drill`,
        {
          question: currentQ.question,
          intention: currentQ.intention,
          userAnswer: userAnswer.trim(),
          skill: skillName,
        },
        { withCredentials: true }
      );

      if (res.data && res.data.evaluation) {
        setEvaluations((prev) => ({
          ...prev,
          [currentIndex]: res.data.evaluation,
        }));
      }
    } catch (err) {
      console.error("Drill evaluation error:", err);
      setEvalError(err.response?.data?.message || "Failed to evaluate answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setEvalError("");
    setCurrentIndex((prev) => prev + 1);
  };

  const isCompleted = currentIndex >= questions.length && questions.length > 0;
  const currentQ = questions[currentIndex];
  const currentEval = evaluations[currentIndex];

  // Calculate final summary stats
  const totalScores = Object.values(evaluations).map((ev) => ev.score || 0);
  const strongCount = totalScores.filter((s) => s >= 70).length;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {/* Modal Header */}
        <div style={modalHeaderStyle}>
          <div>
            <span style={badgeStyle}>Micro-Drill</span>
            <h3 style={{ margin: "4px 0 0 0", color: "#f5f0ea", fontSize: "1.2rem" }}>
              Skill: {skillName}
            </h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            ✕
          </button>
        </div>

        {/* Loading Questions State */}
        {loadingQuestions && (
          <div style={{ padding: "40px", textAlign: "center", color: "#e8823a" }}>
            <div className="spinner" style={{ marginBottom: "12px" }}>⚡</div>
            Generating 3 targeted practice questions for <strong>{skillName}</strong>...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ padding: "24px", color: "#b8453a", textAlign: "center" }}>
            <p>{error}</p>
            <button onClick={onClose} style={actionBtnStyle}>
              Close
            </button>
          </div>
        )}

        {/* Active Questions Flow */}
        {!loadingQuestions && !error && !isCompleted && currentQ && (
          <div style={{ padding: "20px" }}>
            {/* Step Counter */}
            <div style={stepTrackerStyle}>
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div style={progressBarStyle}>
                <div
                  style={{
                    ...progressFillStyle,
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div style={questionBoxStyle}>
              <h4 style={{ margin: "0 0 8px 0", color: "#f5f0ea", fontSize: "1.05rem" }}>
                {currentQ.question}
              </h4>
              {currentQ.intention && (
                <p style={{ margin: 0, color: "#8c8278", fontSize: "0.85rem", fontStyle: "italic" }}>
                  💡 <strong>Interviewer Intention:</strong> {currentQ.intention}
                </p>
              )}
            </div>

            {/* Answer Input or Feedback View */}
            {!currentEval ? (
              <form onSubmit={handleSubmitAnswer} style={{ marginTop: "16px" }}>
                <label style={labelStyle}>Your Answer:</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your focused technical answer here..."
                  rows={4}
                  style={textareaStyle}
                  disabled={evaluating}
                />
                {evalError && <p style={{ color: "#b8453a", fontSize: "0.85rem" }}>{evalError}</p>}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    type="submit"
                    disabled={evaluating || !userAnswer.trim()}
                    style={submitBtnStyle(evaluating || !userAnswer.trim())}
                  >
                    {evaluating ? "Evaluating via AI..." : "Submit Answer"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: "16px" }}>
                {/* Score Header */}
                <div style={evalScoreHeaderStyle(currentEval.score)}>
                  <div>
                    <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      Score: {currentEval.score}/100
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#8c8278" }}>
                    Clarity: {currentEval.clarityScore} | Structure: {currentEval.structureScore} | Depth: {currentEval.depthScore}
                  </div>
                </div>

                {/* Feedback Sections */}
                {currentEval.strengths?.length > 0 && (
                  <div style={feedbackBlockStyle("#2e4a38")}>
                    <strong style={{ color: "#8ab89c" }}>Key Strengths:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                      {currentEval.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEval.improvements?.length > 0 && (
                  <div style={feedbackBlockStyle("#4a3b2e")}>
                    <strong style={{ color: "#d9a441" }}>Actionable Improvements:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                      {currentEval.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEval.rewrittenExample && (
                  <div style={feedbackBlockStyle("#1c1713")}>
                    <strong style={{ color: "#e8823a" }}>Senior Rewritten Model Answer:</strong>
                    <p style={{ margin: "6px 0 0 0", fontSize: "0.9rem", color: "#f5f0ea" }}>
                      "{currentEval.rewrittenExample}"
                    </p>
                  </div>
                )}

                {/* Next Question Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button onClick={handleNext} style={actionBtnStyle}>
                    {currentIndex + 1 < questions.length ? "Next Question →" : "View Drill Summary →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drill Completed Summary Screen */}
        {isCompleted && (
          <div style={{ padding: "30px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🏆</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#f5f0ea" }}>Micro-Drill Completed!</h3>
            <p style={{ color: "#8c8278", margin: "0 0 20px 0" }}>
              Targeted Skill: <strong>{skillName}</strong>
            </p>
            <div style={summaryBadgeStyle}>
              <span>{strongCount} of {questions.length} answers were strong (70+ score)</span>
            </div>
            <button onClick={onClose} style={actionBtnStyle}>
              Close Drill
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline Styles for warm ember theme consistency
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(10, 8, 6, 0.82)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalContentStyle = {
  backgroundColor: "#1c1713",
  border: "1px solid #382c24",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "640px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  color: "#f5f0ea",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #2e241c",
};

const badgeStyle = {
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: "#e8823a",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "#8c8278",
  fontSize: "1.2rem",
  cursor: "pointer",
};

const stepTrackerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "0.85rem",
  color: "#8c8278",
  marginBottom: "12px",
};

const progressBarStyle = {
  height: "6px",
  backgroundColor: "#2e241c",
  borderRadius: "3px",
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  backgroundColor: "#e8823a",
  transition: "width 0.3s ease",
};

const questionBoxStyle = {
  backgroundColor: "#13100e",
  border: "1px solid #2e241c",
  borderRadius: "8px",
  padding: "14px 16px",
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  color: "#8c8278",
  marginBottom: "6px",
};

const textareaStyle = {
  width: "100%",
  backgroundColor: "#13100e",
  border: "1px solid #382c24",
  borderRadius: "8px",
  color: "#f5f0ea",
  padding: "10px 12px",
  fontSize: "0.95rem",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const submitBtnStyle = (disabled) => ({
  backgroundColor: disabled ? "#382c24" : "#e8823a",
  color: disabled ? "#8c8278" : "#0f0d0b",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: "bold",
  cursor: disabled ? "not-allowed" : "pointer",
});

const actionBtnStyle = {
  backgroundColor: "#e8823a",
  color: "#0f0d0b",
  border: "none",
  borderRadius: "6px",
  padding: "10px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const evalScoreHeaderStyle = (score) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#13100e",
  padding: "12px 16px",
  borderRadius: "8px",
  borderLeft: `4px solid ${score >= 70 ? "#8ab89c" : score >= 50 ? "#e8823a" : "#b8453a"}`,
  marginBottom: "12px",
});

const feedbackBlockStyle = (bgColor) => ({
  backgroundColor: bgColor,
  padding: "12px 14px",
  borderRadius: "6px",
  marginBottom: "10px",
  fontSize: "0.88rem",
});

const summaryBadgeStyle = {
  display: "inline-block",
  backgroundColor: "#13100e",
  border: "1px solid #e8823a",
  color: "#e8823a",
  padding: "8px 16px",
  borderRadius: "20px",
  fontWeight: "bold",
  marginBottom: "20px",
};

export default SkillDrillModal;
