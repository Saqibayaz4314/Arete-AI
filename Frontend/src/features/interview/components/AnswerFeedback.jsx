import React, { useState } from 'react';

const Icons = {
  Check: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#8a9a7e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#e8823a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  MinusCircle: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#b8453a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  ChevronDown: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
};

const AnswerFeedback = ({ evaluation }) => {
  const [showExample, setShowExample] = useState(false);

  if (!evaluation) return null;

  const {
    score = 0,
    clarityScore = 0,
    structureScore = 0,
    depthScore = 0,
    strengths = [],
    improvements = [],
    missingPoints = [],
    rewrittenExample = ""
  } = evaluation;

  return (
    <div className="answer-feedback-container animate-fade-in">
      <div className="feedback-header">
        <h4>AI Feedback & Grading</h4>
      </div>

      <div className="scores-overview">
        {/* Main circular score */}
        <div className="main-score-circle" style={{ position: "relative", width: "84px", height: "84px", flexShrink: 0, filter: "drop-shadow(0 0 10px rgba(232, 130, 58, 0.3))" }}>
          <svg width="84" height="84" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="answerScoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f79e58" />
                <stop offset="100%" stopColor="#e8823a" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="38" stroke="rgba(245, 240, 234, 0.08)" strokeWidth="7" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="url(#answerScoreRingGrad)"
              strokeWidth="7"
              fill="none"
              strokeDasharray="238.76"
              strokeDashoffset={238.76 - (238.76 * score) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "#ffffff", lineHeight: "1" }}>
              {score}<span style={{ fontSize: "0.75rem", color: "#e8823a" }}>%</span>
            </span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted, #80766a)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "2px", fontWeight: "600" }}>Score</span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="sub-scores-grid">
          <div className="sub-score-bar-item">
            <div className="bar-labels">
              <span>Clarity & Tone</span>
              <span>{clarityScore}/100</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${clarityScore}%` }}></div>
            </div>
          </div>

          <div className="sub-score-bar-item">
            <div className="bar-labels">
              <span>Structure (STAR / Logic)</span>
              <span>{structureScore}/100</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${structureScore}%` }}></div>
            </div>
          </div>

          <div className="sub-score-bar-item">
            <div className="bar-labels">
              <span>Depth & Detail</span>
              <span>{depthScore}/100</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${depthScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-details-grid">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="feedback-section strengths-sec">
            <h5>Key Strengths</h5>
            <ul>
              {strengths.map((item, idx) => (
                <li key={idx} className="strength-item">
                  <span className="bullet-icon"><Icons.Check /></span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="feedback-section improvements-sec">
            <h5>Areas for Improvement</h5>
            <ul>
              {improvements.map((item, idx) => (
                <li key={idx} className="improvement-item">
                  <span className="bullet-icon"><Icons.AlertTriangle /></span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Points */}
        {missingPoints.length > 0 && (
          <div className="feedback-section missing-sec">
            <h5>Critical Points Missed</h5>
            <ul>
              {missingPoints.map((item, idx) => (
                <li key={idx} className="missing-item">
                  <span className="bullet-icon"><Icons.MinusCircle /></span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Collapsible Model Answer */}
      {rewrittenExample && (
        <div className="rewritten-example-wrapper">
          <button 
            type="button"
            className={`example-toggle-btn ${showExample ? 'active' : ''}`}
            onClick={() => setShowExample(!showExample)}
          >
            <span>See how a model candidate answers</span>
            <Icons.ChevronDown className="chevron" />
          </button>
          
          <div className={`example-content-drawer ${showExample ? 'open' : ''}`}>
            <div className="example-content-inner ai-monospace">
              <p>{rewrittenExample}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerFeedback;
