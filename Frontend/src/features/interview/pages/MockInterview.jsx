import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { useToast } from "../../../context/ToastContext"
import "../style/mockInterview.scss"

const Icons = {
  Mic: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  MicOff: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.18 1.62" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Volume2: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeX: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

const MockInterview = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  // App states
  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  // Stage of Mock: 'intro' | 'active' | 'summary'
  const [stage, setStage] = useState("intro")
  const [mode, setMode] = useState("mix") // 'mix' | 'technical' | 'behavioral'
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)

  // Audio / Speech Recognition state
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)

  // Submission / Feedback states
  const [evaluating, setEvaluating] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [sessionEvaluations, setSessionEvaluations] = useState([])

  const recognitionRef = useRef(null)
  // Ref kept in sync with isRecording state — needed inside recognition event closures
  // which close over stale state if we use the state variable directly
  const isRecordingRef = useRef(false)
  // Accumulates transcript across auto-restarts — Chrome stops recognition after
  // ~5-10s of silence even with continuous=true, firing onend and losing results
  const accumulatedTranscriptRef = useRef("")

  // 1. Fetch Report on Mount
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoadingReport(true)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/interview/report/${interviewId}`,
          { withCredentials: true }
        )
        if (response.data && response.data.interviewReport) {
          setReport(response.data.interviewReport)
        } else {
          const msg = "Could not fetch interview details."
          setErrorMsg(msg)
          toast.showError(msg)
        }
      } catch (err) {
        console.error("Failed to load interview report:", err)
        const status = err.response?.status
        let msg = "Failed to load interview. Please ensure you are logged in."
        if (status === 404) {
          msg = "Interview report not found (404)."
        } else if (status === 500) {
          msg = "Server error while loading report (500)."
        } else if (status === 401) {
          msg = "Unauthorized (401). Please login first."
        } else if (err.message) {
          msg = `Failed to load interview: ${err.message}`
        }
        setErrorMsg(msg)
        toast.showError(msg)
      } finally {
        setLoadingReport(false)
      }
    }
    fetchReport()
  }, [interviewId])

  // 2. Detect Browser Speech Recognition Support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recog = new SpeechRecognition()
      recog.continuous = true
      recog.interimResults = true
      recog.lang = "en-US"

      // FIX 1b: Use event.resultIndex (not looping from 0) to avoid reprocessing
      // old results. Append final text to the accumulated ref so cross-restart
      // transcript is preserved correctly.
      recog.onresult = (event) => {
        let interimTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            accumulatedTranscriptRef.current += text + " "
          } else {
            interimTranscript += text
          }
        }
        setTranscript(accumulatedTranscriptRef.current + interimTranscript)
      }

      recog.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          // Fatal: user denied mic — stop and show message
          setErrorMsg("Microphone permission denied. Please allow microphone access in browser settings to use voice mock.")
          isRecordingRef.current = false
          setIsRecording(false)
        } else if (event.error === "no-speech") {
          // Non-fatal: Chrome fires this when no speech detected within timeout.
          // The onend handler below will auto-restart if still recording.
        } else if (event.error === "network") {
          // Chrome Speech API requires internet even on localhost
          setErrorMsg("Network error: Chrome's speech recognition requires an active internet connection. Please check your connection and try again.")
          isRecordingRef.current = false
          setIsRecording(false)
        }
      }

      // FIX 1a: Chrome auto-stops recognition after a silence pause even with
      // continuous=true. If the user hasn't manually stopped (isRecordingRef is
      // still true), restart automatically so they don't lose mid-answer.
      recog.onend = () => {
        if (isRecordingRef.current) {
          // Recognition stopped itself (not user-initiated) — restart silently
          try {
            recog.start()
          } catch (e) {
            // If restart fails (e.g. already started), stop gracefully
            isRecordingRef.current = false
            setIsRecording(false)
          }
        } else {
          setIsRecording(false)
        }
      }

      recognitionRef.current = recog
    } else {
      setSpeechSupported(false)
    }
  }, [])

  // 3. Text to Speech helper
  const speakQuestion = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel() // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text)
    // Find a good premium/natural sounding English voice if possible
    const voices = window.speechSynthesis.getVoices()
    const naturalVoice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) || voices.find(v => v.lang.startsWith("en"))
    if (naturalVoice) utterance.voice = naturalVoice
    utterance.rate = 1.05
    window.speechSynthesis.speak(utterance)
  }

  // Speak when question changes
  useEffect(() => {
    if (stage === "active" && questions.length > 0) {
      const q = questions[currentIdx]
      if (q) {
        // Delay speaking slightly so the UI transitions smoothly first
        const timer = setTimeout(() => {
          speakQuestion(q.question)
        }, 600)
        return () => clearTimeout(timer)
      }
    }
  }, [stage, currentIdx, questions])

  // Stop synthesis on unmount or stage change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [stage])

  // 4. Start Interview Session
  const handleStartInterview = () => {
    if (!report) return

    let list = []
    // Combine questions based on chosen mode
    const techQuestions = (report.technicalQuestions || []).map((q, idx) => ({
      ...q,
      type: "technical",
      originalIndex: idx
    }))
    const behQuestions = (report.behavioralQuestions || []).map((q, idx) => ({
      ...q,
      type: "behavioral",
      originalIndex: idx
    }))

    if (mode === "technical") {
      list = techQuestions.slice(0, 5)
    } else if (mode === "behavioral") {
      list = behQuestions.slice(0, 5)
    } else {
      // Alternate / Mix of both, max 5 total questions
      const maxCount = Math.max(techQuestions.length, behQuestions.length)
      for (let i = 0; i < maxCount; i++) {
        if (techQuestions[i]) list.push(techQuestions[i])
        if (behQuestions[i]) list.push(behQuestions[i])
      }
      list = list.slice(0, 5)
    }

    if (list.length === 0) {
      setErrorMsg("No questions available for the selected mode.")
      return
    }

    setQuestions(list)
    setCurrentIdx(0)
    setTranscript("")
    setFeedback(null)
    setSessionEvaluations([])
    setErrorMsg("")
    setStage("active")
  }

  // 5. Toggle Recording
  const handleToggleRecording = () => {
    if (!recognitionRef.current) return
    setErrorMsg("")

    if (isRecording) {
      // User manually stopped — set ref first so onend knows not to restart
      isRecordingRef.current = false
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      try {
        // Fresh start: reset the accumulated transcript so previous answer
        // text doesn't bleed into the new answer
        accumulatedTranscriptRef.current = ""
        setTranscript("")
        isRecordingRef.current = true
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
        isRecordingRef.current = false
      }
    }
  }

  // 6. Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      const msg = "Please record or type an answer before submitting."
      setErrorMsg(msg)
      toast.showWarning(msg)
      return
    }

    const currentQuestion = questions[currentIdx]
    if (!currentQuestion) return

    setEvaluating(true)
    setErrorMsg("")

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/evaluation/${interviewId}/${currentQuestion.type}/${currentQuestion.originalIndex}`,
        { userAnswer: transcript },
        { withCredentials: true }
      )

      if (response.data && response.data.evaluation) {
        const evalData = response.data.evaluation

        // If the AI itself flagged the content as inappropriate, show a clear
        // warning instead of displaying all-zero "feedback" to the user.
        // Do NOT auto-advance — let them revise and resubmit.
        if (evalData.flagged) {
          const msg = "This response couldn't be evaluated — please provide a genuine, relevant answer to the question."
          setErrorMsg(msg)
          toast.showWarning(msg)
        } else {
          setFeedback(evalData)
          setSessionEvaluations((prev) => [...prev, evalData])
          toast.showSuccess("Answer evaluated successfully!")
        }
      } else {
        const msg = "Failed to generate evaluation feedback. Please try again."
        setErrorMsg(msg)
        toast.showError(msg)
      }
    } catch (err) {
      console.error("Failed to evaluate mock answer:", err)
      const msg = err.response?.data?.message || "An error occurred while evaluating your response. Please try again."
      setErrorMsg(msg)
      toast.showError(msg)
    } finally {
      setEvaluating(false)
    }
  }

  // 7. Move to Next Question
  const handleNextQuestion = () => {
    // Reset accumulated transcript ref for the new question
    accumulatedTranscriptRef.current = ""
    setTranscript("")
    setFeedback(null)
    setErrorMsg("")

    // Stop any ongoing recording before moving to next question
    if (isRecordingRef.current && recognitionRef.current) {
      isRecordingRef.current = false
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1)
    } else {
      setStage("summary")
    }
  }

  // Calculate Average score for final screen
  const getAverageScore = () => {
    if (sessionEvaluations.length === 0) return 0
    const sum = sessionEvaluations.reduce((acc, curr) => acc + (curr.score || 0), 0)
    return Math.round(sum / sessionEvaluations.length)
  }

  if (loadingReport) {
    return (
      <div className="mock-interview-container loading-state">
        <div className="pulse-spinner"></div>
        <p>Initializing voice engine & practice workspace...</p>
      </div>
    )
  }

  return (
    <div className="mock-interview-container">
      {/* Top Header */}
      <header className="mock-header">
        <button className="back-btn" onClick={() => navigate(`/interview/${interviewId}`)}>
          <Icons.ArrowLeft />
          <span>Practice Workspace</span>
        </button>
        <div className="title-section">
          <h2>Live Voice Simulator</h2>
          <span className="calib-badge">{report?.targetCompany || "General Calibrated"}</span>
        </div>
        <div className="tts-toggle" onClick={() => setTtsEnabled(!ttsEnabled)}>
          {ttsEnabled ? <Icons.Volume2 /> : <Icons.VolumeX />}
          <span>TTS {ttsEnabled ? "ON" : "OFF"}</span>
        </div>
      </header>

      {errorMsg && (
        <div className="error-banner">
          <Icons.Info />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Panel Content */}
      <div className="mock-panel-wrapper">
        {stage === "intro" && (
          <div className="intro-card glass-panel">
            <div className="card-header">
              <Icons.Sparkles />
              <h3>Mock Interview Simulator</h3>
            </div>
            <p className="description">
              Simulate a real-time, interactive phone or video call interview. Arete will speak each question using text-to-speech. You will record your responses directly using your microphone, and our grading pipeline will evaluate your answers in real time.
            </p>

            {!speechSupported && (
              <div className="warning-callout">
                <Icons.Info />
                <p><strong>Speech Recognition is not supported by your browser.</strong> You can still participate in the mock simulator by typing your answers directly into the text fields.</p>
              </div>
            )}

            <div className="settings-section">
              <h4>Choose Interview Focus:</h4>
              <div className="mode-options">
                <button className={`mode-btn ${mode === "mix" ? "active" : ""}`} onClick={() => setMode("mix")}>
                  Full Mock Mix (5 Questions)
                </button>
                <button className={`mode-btn ${mode === "technical" ? "active" : ""}`} onClick={() => setMode("technical")}>
                  Technical Calibrated (5 Questions)
                </button>
                <button className={`mode-btn ${mode === "behavioral" ? "active" : ""}`} onClick={() => setMode("behavioral")}>
                  Behavioral STAR Prep (5 Questions)
                </button>
              </div>
            </div>

            <button className="start-session-btn" onClick={handleStartInterview}>
              Start Practice Session
            </button>
          </div>
        )}

        {stage === "active" && questions.length > 0 && (
          <div className="active-console glass-panel">
            {/* Session stats indicator */}
            <div className="console-progress">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>

            {/* AI Prompter Frame */}
            <div className="ai-prompter-box">
              <div className="avatar-orb">AI</div>
              <div className="prompt-bubble">
                <div className="bubble-header">
                  <span className="q-type-badge">{questions[currentIdx].type}</span>
                  {window.speechSynthesis && (
                    <button className="replay-btn" onClick={() => speakQuestion(questions[currentIdx].question)} title="Replay question audio">
                      <Icons.Volume2 />
                    </button>
                  )}
                </div>
                <h3>{questions[currentIdx].question}</h3>
              </div>
            </div>

            {/* Workspace splits */}
            <div className="practice-splits">
              {/* Left Column: Response Input */}
              <div className="response-input-pane">
                <label>Your Spoken or Written Response:</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={speechSupported ? "Click the microphone button to start speaking, or type your answer directly..." : "Type your answer directly here..."}
                  disabled={evaluating || !!feedback}
                  rows={8}
                />

                <div className="controls-row">
                  {speechSupported && !feedback && (
                    <button
                      className={`mic-trigger-btn ${isRecording ? "recording" : ""}`}
                      onClick={handleToggleRecording}
                      disabled={evaluating}
                    >
                      {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
                      <span>{isRecording ? "Stop Recording" : "Record Voice Answer"}</span>
                    </button>
                  )}
                  
                  {!feedback && (
                    <button
                      className="submit-eval-btn"
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !transcript.trim()}
                    >
                      {evaluating ? (
                        <>
                          <div className="btn-spinner"></div>
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Icons.Sparkles />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  )}

                  {feedback && (
                    <button className="next-q-btn" onClick={handleNextQuestion}>
                      <span>{currentIdx + 1 < questions.length ? "Next Question" : "Finish Interview"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Instant AI feedback */}
              <div className="instant-feedback-pane">
                {feedback ? (
                  <div className="feedback-inner card-fade-in">
                    <div className="feedback-hero-score">
                      <div className="score-badge">
                        <span className="score-num">{feedback.score || 0}</span>
                        <span className="score-lbl">Overall</span>
                      </div>
                      <div className="subscores-list">
                        <div className="subscore-item">
                          <span>Clarity</span>
                          <strong>{feedback.clarityScore || 0}%</strong>
                        </div>
                        <div className="subscore-item">
                          <span>Structure</span>
                          <strong>{feedback.structureScore || 0}%</strong>
                        </div>
                        <div className="subscore-item">
                          <span>Depth</span>
                          <strong>{feedback.depthScore || 0}%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="feedback-bullets">
                      <div className="bullet-group strengths">
                        <h5>Strengths</h5>
                        <ul>
                          {feedback.strengths && feedback.strengths.map((str, i) => (
                            <li key={i}><Icons.Check /> {str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bullet-group improvements">
                        <h5>Suggested Improvements</h5>
                        <ul>
                          {feedback.improvements && feedback.improvements.map((imp, i) => (
                            <li key={i}>• {imp}</li>
                          ))}
                        </ul>
                      </div>

                      {feedback.missingPoints && feedback.missingPoints.length > 0 && (
                        <div className="bullet-group missing">
                          <h5>Points You Missed</h5>
                          <ul>
                            {feedback.missingPoints.map((pt, i) => (
                              <li key={i}>• {pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {feedback.rewrittenExample && (
                        <div className="stronger-response-box">
                          <h5>Stronger Suggested Formulation:</h5>
                          <p>{feedback.rewrittenExample}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="feedback-placeholder">
                    <Icons.Info />
                    <p>Once you submit your answer, real-time breakdown of strengths, weaknesses, and a rewritten high-score formulation will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === "summary" && (
          <div className="summary-report glass-panel card-fade-in">
            <div className="summary-header">
              <Icons.Sparkles />
              <h3>Practice Session Summary</h3>
              <p>Great job! You have successfully completed the mock interview session.</p>
            </div>

            <div className="summary-metrics-block">
              <div className="big-meter">
                <span className="avg-num">{getAverageScore()}</span>
                <span className="avg-lbl">Average Score</span>
              </div>
              <div className="summary-desc">
                <h4>Focus: {mode === "mix" ? "Mixed Skills" : mode === "technical" ? "Technical Practice" : "Behavioral STAR"}</h4>
                <p>Questions answered: {sessionEvaluations.length}</p>
                <p>Your performance highlights how well you adapt to real-time, high-pressure prompts. Focus on the suggestions in the preparation plan to keep improving.</p>
              </div>
            </div>

            <div className="summary-history-list">
              <h4>Session Questions & Scores</h4>
              {sessionEvaluations.map((item, idx) => {
                const correspondingQuestion = questions[item.questionIndex] || questions[idx] || {}
                return (
                  <div key={idx} className="summary-history-row">
                    <span className="row-num">Q{idx + 1}</span>
                    <div className="row-details">
                      <span className="row-q">{correspondingQuestion.question || "Mock Interview Question"}</span>
                      <span className="row-type">{item.questionType}</span>
                    </div>
                    <span className={`row-score ${item.score >= 80 ? 'high' : item.score >= 50 ? 'med' : 'low'}`}>{item.score}%</span>
                  </div>
                )
              })}
            </div>

            <div className="summary-actions">
              <button className="primary-btn" onClick={() => navigate(`/interview/${interviewId}`)}>
                Return to Practice Workspace
              </button>
              <button className="secondary-btn" onClick={() => { setStage("intro"); setSessionEvaluations([]); setFeedback(null); }}>
                Restart Another Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MockInterview
