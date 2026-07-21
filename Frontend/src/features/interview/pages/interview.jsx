import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import "../style/interview.scss"
import AnswerFeedback from '../components/AnswerFeedback'
import SkillDrillModal from '../components/SkillDrillModal'
import axios from 'axios'
import API_BASE, { api } from '../../../utils/api'

import { useToast } from '../../../context/ToastContext'
import { generateInterviewReportPdf } from '../utils/generatePdf'

// Crisp embedded icons
const Icons = {
  ChevronDown: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  CheckCircle: ({ style = {} }) => (
    <svg style={style} viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  XCircle: ({ style = {} }) => (
    <svg style={style} viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

const defaultReportData = {
  matchScore: 88,
  technicalQuestions: [
    {
      question: "Explain the Node.js Event Loop and how it handles asynchronous operations.",
      intention: "To test core knowledge of non-blocking I/O and event-driven architecture.",
      answer: "Start with high-level definition: event-driven, non-blocking I/O model. Mention phases: timers, pending callbacks, idle/prepare, poll, check, close. Explain call stack vs callback queue vs microtask queue (Promises/process.nextTick). Mention libuv layer."
    },
    {
      question: "How would you design a scalable system for real-time notifications using WebSockets?",
      intention: "To evaluate system design principles, state handling, and horizontal scaling strategy.",
      answer: "Discuss client socket connection initialization, connection persistent management via Redis Pub/Sub, horizontal scaling with sticky sessions or gateway routers, message delivery guarantees, and fallback to SSE/polling."
    },
    {
      question: "What strategies do you use to optimize React rendering performance in large applications?",
      intention: "To check frontend optimization knowledge and awareness of React internal reconciliation.",
      answer: "Mention React DevTools profiler, component splitting, useMemo/useCallback usage guidelines, avoiding inline functions in renders, virtualized lists for large datasets (e.g. react-window), and lazy loading routes with Suspense."
    },
    {
      question: "Explain the difference between SQL and NoSQL databases and when you would choose MongoDB over PostgreSQL.",
      intention: "To assess data modeling capability and understanding of ACID vs BASE trade-offs.",
      answer: "Compare relational structured tables (ACID compliance) vs document-oriented JSON/BSON flexibility. Choose MongoDB for unstructured/semi-structured rapidly evolving schemas, horizontal sharding needs, or document-centric domain models."
    },
    {
      question: "In a MongoDB environment, when would you use an aggregation pipeline instead of a simple find() query?",
      intention: "To check the candidate's proficiency with advanced database operations and data transformation.",
      answer: "Use aggregation for complex data processing such as grouping data (sum, average), joining collections (lookup), filtering nested arrays, or transforming data shapes before returning them to the client. Mention that find() is for simple retrieval, while aggregate is for multi-stage processing."
    }
  ],
  behavioralQuestions: [
    {
      question: "Tell me about a time you had to deliver a project with ambiguous requirements from a founder.",
      intention: "To assess adaptability and communication skills in a startup environment, as mentioned in the resume.",
      answer: "Use the STAR method. Describe a specific instance at Techverse Inventra or AveronX. Explain how you initiated a meeting to clarify goals, created a technical prototype for feedback, and iteratively refined the requirements to ensure the final product met their vision."
    },
    {
      question: "Describe a situation where you had to learn a new technology or tool very quickly to complete a task.",
      intention: "To evaluate the candidate's learning agility and self-motivation.",
      answer: "Reference your experience with Cypress automation at 99 Technologies. Mention the resources you used (documentation, tutorials), how you practiced in a sandbox environment, and how you eventually implemented automated scripts that improved the team's QA efficiency."
    },
    {
      question: "How do you handle a situation where a teammate disagrees with your technical approach?",
      intention: "To test collaboration and conflict resolution skills within an Agile team.",
      answer: "Emphasize open-mindedness and data-driven decision-making. Explain how you would listen to their perspective, compare the pros and cons of both approaches (scalability, maintainability, performance), and if necessary, involve a lead or reach a compromise that serves the project's best interest."
    },
    {
      question: "Tell me about a difficult bug you encountered in production and how you resolved it.",
      intention: "To judge problem-solving skills and the ability to work under pressure.",
      answer: "Describe the symptoms of the bug, the tools used for debugging (logs, browser dev tools), the root cause (e.g., a race condition or unhandled edge case in the Farmer Marketplace), and the long-term fix you implemented to prevent recurrence."
    },
    {
      question: "How do you stay updated with the latest trends in Full-Stack development?",
      intention: "To see if the candidate is proactive about continuous learning and professional growth.",
      answer: "Mention specific blogs, newsletters (like Node Weekly), or platforms (like Dev.to/Medium). Talk about your current goal of improving DSA and system design knowledge as stated in your self-description, and how you apply new learnings to personal projects."
    }
  ],
  skillGaps: [
    { skill: "TypeScript", severity: "medium" },
    { skill: "Docker & Containerization", severity: "high" },
    { skill: "Advanced Data Structures & Algorithms", severity: "medium" },
    { skill: "AWS Cloud Basics", severity: "high" }
  ],
  preparationPlan: [
    {
      day: 1,
      focus: "Foundational DSA and System Architecture",
      tasks: [
        "Solve 3 Medium LeetCode problems on HashMaps and Arrays",
        "Read about system design trade-offs (CAP theorem, PACELC)",
        "Review JavaScript event loop mechanisms"
      ]
    },
    {
      day: 2,
      focus: "Advanced React Patterns and Performance",
      tasks: [
        "Practice implementing custom React hooks for data fetching",
        "Study React reconciliation engine and Fiber architecture",
        "Optimize a sample app using React.memo and useMemo"
      ]
    },
    {
      day: 3,
      focus: "Backend Architecture and Express Best Practices",
      tasks: [
        "Build a rate limiter middleware from scratch using Redis",
        "Study authentication patterns: JWT access/refresh token rotation",
        "Review error handling middleware patterns in Express"
      ]
    },
    {
      day: 4,
      focus: "Database Indexing and Query Optimization",
      tasks: [
        "Write 3 complex MongoDB aggregation pipelines ($lookup, $unwind, $group)",
        "Understand compound indexes and explain() plans in MongoDB",
        "Compare SQL vs NoSQL transactions"
      ]
    },
    {
      day: 5,
      focus: "TypeScript Migration and Strongly Typed Code",
      tasks: [
        "Convert a Node.js Express service from JavaScript to TypeScript",
        "Practice writing generic interfaces and utility types in TS",
        "Set up strict tsconfig rules for a project"
      ]
    },
    {
      day: 6,
      focus: "DevOps Basics, Docker and CI/CD Pipelines",
      tasks: [
        "Containerize a MERN app using a Dockerfile and Docker Compose",
        "Learn basic AWS concepts: S3 for image uploads and EC2 for hosting",
        "Write 3 unit tests using Jest for an Express utility function"
      ]
    },
    {
      day: 7,
      focus: "Mock Interviews and Behavioral Prep",
      tasks: [
        "Record yourself answering behavioral questions using the STAR method",
        "Review your projects and be ready to explain every technical choice",
        "Do a final walkthrough of the MERN stack interview cheatsheet"
      ]
    }
  ],
  resumeFeedback: {
    resumeScore: 78,
    weakBulletPoints: [
      {
        original: "Responsible for managing backend systems and APIs",
        improved: "Engineered scalable Node.js/Express APIs serving 50K+ users, reducing response latencies by 35% through Redis caching",
        issue: "Too vague — lacks measurable impact, technical depth, and specific metrics."
      },
      {
        original: "Worked on frontend bugs and UI features",
        improved: "Refactored key React UI flows, improving Lighthouse accessibility score from 68 to 94 and reducing render re-draws",
        issue: "Passive phrasing — fails to emphasize ownership or performance improvements."
      }
    ],
    missingSections: ["Quantifiable Business Achievements", "Cloud / DevOps Certifications Section"],
    atsKeywordGaps: ["Docker", "CI/CD", "Kubernetes", "AWS S3"]
  }
}

const Interview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { interviewId } = useParams()
  const toast = useToast()

  // Attempt to read report from router state, fallback to local storage or demo report
  const [report, setReport] = useState(() => {
    if (location.state?.report) {
      localStorage.setItem(`report_${interviewId}`, JSON.stringify(location.state.report))
      return location.state.report
    }
    const cached = localStorage.getItem(`report_${interviewId}`)
    return cached ? JSON.parse(cached) : defaultReportData
  })

  const [activeTab, setActiveTab] = useState("technical") // 'technical', 'behavioral', 'roadmap', 'resumeFeedback'
  const [expandedTech, setExpandedTech] = useState({})
  const [expandedBeh, setExpandedBeh] = useState({})
  const currentId = interviewId || report?._id || 'demo'

  const [completedTasks, setCompletedTasks] = useState(() => {
    if (!currentId) return {}
    const saved = localStorage.getItem(`tasks_${currentId}`)
    return saved ? JSON.parse(saved) : {}
  })

  // Reload completed roadmap tasks whenever currentId changes
  useEffect(() => {
    if (currentId) {
      const saved = localStorage.getItem(`tasks_${currentId}`)
      if (saved) {
        setCompletedTasks(JSON.parse(saved))
      }
    }
  }, [currentId])

  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [loadingEvals, setLoadingEvals] = useState({})
  const [evalErrors, setEvalErrors] = useState({})
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // Drill Modal state
  const [drillModal, setDrillModal] = useState(null) // { skillIndex, skillName }

  const handleDownloadPdf = () => {
    setPdfGenerating(true)
    // jsPDF runs synchronously — setTimeout lets the button state render first
    setTimeout(() => {
      try {
        generateInterviewReportPdf(report)
      } catch (err) {
        console.error("PDF generation error:", err)
        toast.showError("Failed to generate PDF. Please try again.")
      } finally {
        setPdfGenerating(false)
      }
    }, 50)
  }

  useEffect(() => {
    const fetchReportAndEvaluations = async () => {
      if (!interviewId || interviewId === 'demo') return

      // 1. Fetch full report from API
      try {
        const reportRes = await api.get(`/api/interview/report/${interviewId}`)
        if (reportRes.data?.interviewReport) {
          setReport(reportRes.data.interviewReport)
          localStorage.setItem(`report_${interviewId}`, JSON.stringify(reportRes.data.interviewReport))
        }
      } catch (err) {
        console.error("Failed to fetch interview report:", err)
      }

      // 2. Fetch existing evaluations
      try {
        const res = await api.get(`/api/evaluation/${interviewId}`)
        if (res.data && res.data.evaluations) {
          const loadedAnswers = {}
          const loadedEvals = {}
          res.data.evaluations.forEach(ev => {
            const key = `${ev.questionType}-${ev.questionIndex}`
            loadedAnswers[key] = ev.userAnswer
            loadedEvals[key] = ev
          })
          setAnswers(prev => ({ ...prev, ...loadedAnswers }))
          setEvaluations(prev => ({ ...prev, ...loadedEvals }))
        }
      } catch (err) {
        console.error("Failed to load existing evaluations:", err)
      }
    }

    fetchReportAndEvaluations()
  }, [interviewId])

  const handleAnswerChange = (type, index, value) => {
    const key = `${type}-${index}`
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleGetFeedback = async (type, index) => {
    const key = `${type}-${index}`
    const ansText = answers[key]
    if (!ansText || !ansText.trim()) {
      toast.showWarning("Please type an answer before requesting feedback.")
      return
    }

    setLoadingEvals(prev => ({ ...prev, [key]: true }))
    setEvalErrors(prev => ({ ...prev, [key]: "" }))

    try {
      const res = await api.post(
        `/api/evaluation/${interviewId}/${type}/${index}`,
        { userAnswer: ansText }
      )
      if (res.data && res.data.evaluation) {
        setEvaluations(prev => ({ ...prev, [key]: res.data.evaluation }))
        toast.showSuccess("AI feedback received!")
      }
    } catch (err) {
      console.error("Answer evaluation error:", err)
      const msg = err.response?.data?.message || "Failed to evaluate answer."
      setEvalErrors(prev => ({ ...prev, [key]: msg }))
      toast.showError(msg)
    } finally {
      setLoadingEvals(prev => ({ ...prev, [key]: false }))
    }
  }

  const toggleTech = (index) => {
    setExpandedTech(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleBeh = (index) => {
    setExpandedBeh(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleTask = (dayIdx, taskIdx) => {
    const key = `${dayIdx}-${taskIdx}`
    setCompletedTasks(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      if (currentId) {
        localStorage.setItem(`tasks_${currentId}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  const resumeFb = report.resumeFeedback || defaultReportData.resumeFeedback

  return (
    <div className="interview-layout-wrapper">
      {/* Back navigation + Download PDF button */}
      <div className="workspace-nav-bar" style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className="back-home-btn" onClick={() => navigate("/")} title="Go back to generator form">
          <Icons.ArrowLeft />
          <span>Generator Form</span>
        </button>
        <button className="back-home-btn" onClick={() => navigate("/dashboard")} title="Go to Progress Dashboard">
          <Icons.Activity />
          <span>Progress Dashboard</span>
        </button>

        {/* PDF Download — placed at end of nav bar, right-aligned */}
        <button
          onClick={handleDownloadPdf}
          disabled={pdfGenerating}
          title="Download full report as PDF"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1.1rem",
            background: pdfGenerating ? "rgba(232,130,58,0.15)" : "rgba(232,130,58,0.12)",
            border: "1px solid rgba(232,130,58,0.35)",
            borderRadius: "8px",
            color: "var(--accent-primary)",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: pdfGenerating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { if (!pdfGenerating) e.currentTarget.style.background = "rgba(232,130,58,0.22)" }}
          onMouseLeave={e => { e.currentTarget.style.background = pdfGenerating ? "rgba(232,130,58,0.15)" : "rgba(232,130,58,0.12)" }}
        >
          <Icons.Download />
          <span>{pdfGenerating ? "Generating…" : "Download PDF"}</span>
        </button>
      </div>

      {/* 3-Column main workspace card */}
      <div className="interview-workspace-card">
        
        {/* Column 1: Left Navigation Sidebar */}
        <aside className="workspace-column left-sidebar">
          <div className="nav-group">
            <button 
              className={`nav-button-chip ${activeTab === "technical" ? "active" : ""}`}
              onClick={() => setActiveTab("technical")}
            >
              Technical questions
            </button>
            <button 
              className={`nav-button-chip ${activeTab === "behavioral" ? "active" : ""}`}
              onClick={() => setActiveTab("behavioral")}
            >
              Behavioral questions
            </button>
            <button 
              className={`nav-button-chip ${activeTab === "roadmap" ? "active" : ""}`}
              onClick={() => setActiveTab("roadmap")}
            >
              Road Map
            </button>
            <button 
              className={`nav-button-chip ${activeTab === "resumeFeedback" ? "active" : ""}`}
              onClick={() => setActiveTab("resumeFeedback")}
            >
              Resume Feedback
            </button>
            <button 
              className="nav-button-chip mock-interview-chip"
              onClick={() => navigate(`/interview/${interviewId}/mock`)}
              style={{
                marginTop: "2.5rem",
                background: "var(--accent-gradient)",
                color: "var(--text-primary)",
                border: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(232, 130, 58, 0.25)",
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <Icons.Mic />
              <span>Live Voice Mock</span>
            </button>
          </div>
        </aside>

        {/* Divider 1 */}
        <div className="workspace-divider"></div>

        {/* Column 2: Middle Main Content Window */}
        <section className="workspace-column middle-content-pane">
          <div className="pane-scroll-container">
            
            {activeTab === "technical" && (
              <div className="content-fade-in">
                <div className="pane-header">
                  <h2>Technical Practice Questions</h2>
                  <p>Expand each question to see the intention behind it and the suggested answer strategy.</p>
                </div>
                <div className="q-list">
                  {report.technicalQuestions && report.technicalQuestions.length > 0 ? (
                    report.technicalQuestions.map((item, i) => {
                      const isExpanded = !!expandedTech[i]
                      return (
                        <div key={i} className={`qa-card ${isExpanded ? "open" : ""}`}>
                          <button className="qa-toggle" onClick={() => toggleTech(i)}>
                            <span className="qa-num">Q{i + 1}</span>
                            <span className="qa-title">{item.question}</span>
                            <Icons.ChevronDown className="chevron" />
                          </button>
                          <div className="qa-body">
                            <div className="qa-body-inner">
                              <div className="intention-callout">
                                <h5><Icons.Info /> Intention:</h5>
                                <p>{item.intention}</p>
                              </div>
                              <div className="answer-callout">
                                <h5>Sample Response:</h5>
                                <p>{item.answer}</p>
                              </div>
                              <div className="practice-response-section">
                                <h5>Your Answer:</h5>
                                <textarea
                                  placeholder="Type your response here to get instant AI grading..."
                                  value={answers[`technical-${i}`] || ""}
                                  onChange={(e) => handleAnswerChange("technical", i, e.target.value)}
                                  className="practice-textarea"
                                  rows={4}
                                  disabled={loadingEvals[`technical-${i}`]}
                                />
                                {evalErrors[`technical-${i}`] && (
                                  <p className="eval-error-text">{evalErrors[`technical-${i}`]}</p>
                                )}
                                <div className="practice-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleGetFeedback("technical", i)}
                                    disabled={loadingEvals[`technical-${i}`]}
                                    className="btn btn-primary"
                                  >
                                    {loadingEvals[`technical-${i}`] ? "Evaluating Answer..." : "Get AI Feedback"}
                                  </button>
                                </div>
                                {evaluations[`technical-${i}`] && (
                                  <AnswerFeedback evaluation={evaluations[`technical-${i}`]} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="empty-text">No technical questions available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "behavioral" && (
              <div className="content-fade-in">
                <div className="pane-header">
                  <h2>Behavioral Practice Questions</h2>
                  <p>Master your STAR method stories for target company leadership principles.</p>
                </div>
                <div className="q-list">
                  {report.behavioralQuestions && report.behavioralQuestions.length > 0 ? (
                    report.behavioralQuestions.map((item, i) => {
                      const isExpanded = !!expandedBeh[i]
                      return (
                        <div key={i} className={`qa-card ${isExpanded ? "open" : ""}`}>
                          <button className="qa-toggle" onClick={() => toggleBeh(i)}>
                            <span className="qa-num behavioral">Q{i + 1}</span>
                            <span className="qa-title">{item.question}</span>
                            <Icons.ChevronDown className="chevron" />
                          </button>
                          <div className="qa-body">
                            <div className="qa-body-inner">
                              <div className="intention-callout">
                                <h5><Icons.Info /> Intention:</h5>
                                <p>{item.intention}</p>
                              </div>
                              <div className="answer-callout">
                                <h5>Sample Response:</h5>
                                <p>{item.answer}</p>
                              </div>
                              <div className="practice-response-section">
                                <h5>Your Answer:</h5>
                                <textarea
                                  placeholder="Type your response here using the STAR method to get instant AI grading..."
                                  value={answers[`behavioral-${i}`] || ""}
                                  onChange={(e) => handleAnswerChange("behavioral", i, e.target.value)}
                                  className="practice-textarea"
                                  rows={4}
                                  disabled={loadingEvals[`behavioral-${i}`]}
                                />
                                {evalErrors[`behavioral-${i}`] && (
                                  <p className="eval-error-text">{evalErrors[`behavioral-${i}`]}</p>
                                )}
                                <div className="practice-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleGetFeedback("behavioral", i)}
                                    disabled={loadingEvals[`behavioral-${i}`]}
                                    className="btn btn-primary"
                                  >
                                    {loadingEvals[`behavioral-${i}`] ? "Evaluating Answer..." : "Get AI Feedback"}
                                  </button>
                                </div>
                                {evaluations[`behavioral-${i}`] && (
                                  <AnswerFeedback evaluation={evaluations[`behavioral-${i}`]} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="empty-text">No behavioral questions available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="content-fade-in">
                <div className="pane-header">
                  <h2>Preparation Syllabus</h2>
                  <p>Check off milestones as you study to build confidence before the call.</p>
                </div>
                <div className="roadmap-timeline">
                  {report.preparationPlan && report.preparationPlan.length > 0 ? (
                    report.preparationPlan.map((dayItem, dIdx) => (
                      <div key={dIdx} className="timeline-block">
                        <div className="timeline-body-card">
                          <div className="timeline-card-header">
                            <span className="day-badge">Day {dayItem.day || dIdx + 1}</span>
                            <h4>{dayItem.focus}</h4>
                          </div>
                          <div className="roadmap-tasks">
                            {dayItem.tasks && dayItem.tasks.map((task, tIdx) => {
                              const isChecked = !!completedTasks[`${dIdx}-${tIdx}`]
                              return (
                                <div 
                                  key={tIdx} 
                                  className={`task-row ${isChecked ? "checked" : ""}`}
                                  onClick={() => toggleTask(dIdx, tIdx)}
                                >
                                  <div className="custom-box">
                                    {isChecked && <Icons.Check />}
                                  </div>
                                  <span className="task-desc">{task}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No preparation plan generated.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "resumeFeedback" && (
              <div className="content-fade-in">
                <div className="pane-header">
                  <h2>AI Resume Improvement Suggestions</h2>
                  <p>Actionable feedback to polish your resume structure, impact language, and ATS keywords.</p>
                </div>

                {/* Score Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.8rem",
                  padding: "1.6rem 2rem",
                  background: "linear-gradient(135deg, rgba(32, 26, 22, 0.9) 0%, rgba(16, 13, 10, 0.95) 100%)",
                  borderRadius: "16px",
                  border: "1px solid rgba(232, 130, 58, 0.3)",
                  boxShadow: "0 12px 35px rgba(0, 0, 0, 0.45), 0 0 20px rgba(232, 130, 58, 0.08)",
                  marginBottom: "1.8rem",
                  backdropFilter: "blur(12px)"
                }}>
                  <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0, filter: "drop-shadow(0 0 10px rgba(232, 130, 58, 0.35))" }}>
                    <svg width="90" height="90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f79e58" />
                          <stop offset="100%" stopColor="#e8823a" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="38" stroke="rgba(245, 240, 234, 0.07)" strokeWidth="7" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="url(#scoreRingGrad)"
                        strokeWidth="7"
                        fill="none"
                        strokeDasharray="238.76"
                        strokeDashoffset={238.76 - (238.76 * (resumeFb?.resumeScore || 75)) / 100}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
                      <span style={{ fontSize: "1.45rem", fontWeight: "800", color: "#ffffff", lineHeight: "1", letterSpacing: "-0.5px" }}>
                        {resumeFb?.resumeScore || 75}<span style={{ fontSize: "0.85rem", color: "#e8823a" }}>%</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "4px", flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, color: "#f5f0ea", fontSize: "1.1rem", fontWeight: "700" }}>Resume Quality Score</h4>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        background: (resumeFb?.resumeScore || 75) >= 75 ? "rgba(138, 184, 156, 0.15)" : "rgba(232, 130, 58, 0.15)",
                        color: (resumeFb?.resumeScore || 75) >= 75 ? "#8ab89c" : "#e8823a",
                        border: (resumeFb?.resumeScore || 75) >= 75 ? "1px solid rgba(138, 184, 156, 0.3)" : "1px solid rgba(232, 130, 58, 0.3)"
                      }}>
                        {(resumeFb?.resumeScore || 75) >= 80 ? "High Quality" : (resumeFb?.resumeScore || 75) >= 60 ? "Good — Room to Improve" : "Needs Structural Polish"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#8c8275", lineHeight: "1.45" }}>
                      Measures clarity, quantifiable metrics, and overall professional writing quality (independent of job fit).
                    </p>
                  </div>
                </div>

                {/* Weak Bullet Points */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <h3 style={{ fontSize: "1.05rem", color: "var(--accent-primary)", marginBottom: "0.9rem", fontWeight: "700" }}>Weak Bullet Point Rewrites</h3>
                  {resumeFb?.weakBulletPoints && resumeFb.weakBulletPoints.length > 0 ? (
                    resumeFb.weakBulletPoints.map((bp, i) => (
                      <div key={i} style={{
                        padding: "1.2rem",
                        background: "rgba(15, 13, 11, 0.75)",
                        border: "1px solid rgba(245, 240, 234, 0.08)",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", color: "#b8453a", fontSize: "0.9rem", marginBottom: "0.6rem", lineHeight: "1.4" }}>
                          <Icons.XCircle style={{ color: "#b8453a", flexShrink: 0, marginTop: "2px" }} />
                          <div>
                            <strong style={{ color: "#d96559" }}>Original:</strong>{" "}
                            <span style={{ textDecoration: "line-through", opacity: 0.85 }}>"{bp.original}"</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", color: "#8ab89c", fontSize: "0.93rem", fontWeight: "600", marginBottom: "0.6rem", lineHeight: "1.45" }}>
                          <Icons.CheckCircle style={{ color: "#8ab89c", flexShrink: 0, marginTop: "2px" }} />
                          <div>
                            <strong style={{ color: "#a5d6b7" }}>Improved:</strong> "{bp.improved}"
                          </div>
                        </div>

                        {bp.issue && (
                          <div style={{ fontSize: "0.82rem", color: "#8c8275", paddingLeft: "1.8rem", fontStyle: "italic" }}>
                            Issue Identified: {bp.issue}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">Your resume bullet points are well-structured!</p>
                  )}
                </div>

                {/* Missing Sections */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <h3 style={{ fontSize: "1rem", color: "var(--accent-primary)", marginBottom: "0.8rem", fontWeight: "700" }}>Missing Recommended Sections</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {resumeFb?.missingSections && resumeFb.missingSections.length > 0 ? (
                      resumeFb.missingSections.map((sec, i) => (
                        <span key={i} style={{ padding: "5px 12px", background: "rgba(217, 164, 65, 0.12)", border: "1px solid rgba(217, 164, 65, 0.3)", borderRadius: "16px", color: "#d9a441", fontSize: "0.84rem", fontWeight: "500" }}>
                          {sec}
                        </span>
                      ))
                    ) : (
                      <p className="empty-text">All key sections are present.</p>
                    )}
                  </div>
                </div>

                {/* ATS Keyword Gaps */}
                <div>
                  <h3 style={{ fontSize: "1rem", color: "#b8453a", marginBottom: "0.8rem", fontWeight: "700" }}>ATS Keyword Gaps (JD Technologies Missing in Resume)</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {resumeFb?.atsKeywordGaps && resumeFb.atsKeywordGaps.length > 0 ? (
                      resumeFb.atsKeywordGaps.map((kw, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(184, 69, 58, 0.15)", border: "1px solid rgba(184, 69, 58, 0.35)", borderRadius: "16px", color: "#e8823a", fontSize: "0.84rem", fontWeight: "600" }}>
                          <Icons.Info style={{ width: "14px", height: "14px" }} />
                          {kw}
                        </span>
                      ))
                    ) : (
                      <p className="empty-text">No significant ATS keyword gaps found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Divider 2 */}
        <div className="workspace-divider"></div>

        {/* Column 3: Right Sidebar */}
        <aside className="workspace-column right-sidebar">
          {/* Match Score Indicator */}
          <div className="match-score-section">
            <div className="score-circle-wrapper">
              <svg viewBox="0 0 36 36" className="score-circle-svg">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle-fill" strokeDasharray={`${report.matchScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="score-number-text">
                <span className="num">{report.matchScore || 0}%</span>
                <span className="lbl">Fit Score</span>
              </div>
            </div>
          </div>

          {/* Target Company calibration */}
          <div className="target-company-section" style={{ marginTop: "0.5rem", marginBottom: "1rem", padding: "1rem", borderRadius: "10px", background: "rgba(22, 19, 17, 0.4)", border: "1px solid rgba(245, 240, 234, 0.06)" }}>
            <h4 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Target Company</h4>
            <div className="company-badge" style={{ display: "inline-flex", marginTop: "0.5rem", padding: "0.3rem 0.8rem", background: "rgba(232, 130, 58, 0.1)", border: "1px solid rgba(232, 130, 58, 0.3)", borderRadius: "20px", color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: "600" }}>
              {report.targetCompany || "General Tech Standard"}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: "1.4" }}>
              All technical and behavioral questions are dynamically calibrated to match this company's interview style and culture.
            </p>
          </div>

          <div className="skill-gaps-section">
            <h3 className="section-title">Skill Gaps</h3>
            <div className="skills-chips-wrapper">
              {report.skillGaps && report.skillGaps.length > 0 ? (
                report.skillGaps.map((item, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
                    <div className={`skill-chip-badge severity-${item.severity || 'medium'}`} title={`${item.severity || 'medium'} severity gap`}>
                      {item.skill}
                    </div>
                    {item.severity === "high" && (
                      <button
                        onClick={() => setDrillModal({ skillIndex: i, skillName: item.skill })}
                        style={{
                          marginTop: "4px",
                          display: "inline-block",
                          fontSize: "0.72rem",
                          padding: "3px 8px",
                          background: "rgba(232, 130, 58, 0.15)",
                          border: "1px solid rgba(232, 130, 58, 0.4)",
                          color: "#e8823a",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        ⚡ Practice This Skill
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-text">No critical gaps detected.</p>
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* Micro-Drill Modal */}
      {drillModal && (
        <SkillDrillModal
          interviewId={interviewId}
          skillIndex={drillModal.skillIndex}
          skillName={drillModal.skillName}
          onClose={() => setDrillModal(null)}
        />
      )}
    </div>
  )
}

export default Interview
