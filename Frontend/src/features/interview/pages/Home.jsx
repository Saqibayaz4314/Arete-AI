import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE, { api } from '../../../utils/api'

import { useAuth } from '../../auth/hooks/useAuth'
import "../style/home.scss"
import { useToast } from '../../../context/ToastContext'

// Arete logo path
const ARETE_LOGO = "/arete_logo.png";

// Crisp embedded SVG icons
const Icons = {
  AreteLogo: () => (
    <img src={ARETE_LOGO} alt="Arete" width="44" height="44" style={{ objectFit: 'contain', display: 'block' }} />
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ChevronDown: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  CheckCircle: ({ className = "" }) => (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// Interactive mockup sandbox report
const demoReport = {
  matchScore: 84,
  jobDescription: "Senior Frontend Engineer - React Developer with emphasis on performance optimization, advanced styling system architecture, and UI/UX state flow designs.",
  resume: "Resume_Developer_Sameer.pdf (Analyzed)",
  selfDescription: "Passionate designer and developer interested in scaling React applications with pristine, pixel-perfect user interfaces.",
  skillGaps: [
    { skill: "Advanced Build-tool configurations (Webpack/Rollup optimization)", severity: "high" },
    { skill: "E2E Testing frameworks (Playwright, Cypress)", severity: "medium" },
    { skill: "State Management with specialized caches (Zustand, React Query)", severity: "low" },
    { skill: "Web Accessibility (WCAG 2.1 compliance details)", severity: "medium" }
  ],
  technicalQuestions: [
    {
      question: "How do you systematically profile and optimize rendering bottlenecks in a deep React component tree?",
      intention: "Evaluating deep familiarity with React DevTools Profiler, layout reflow detection, commit phase timings, and memoization hooks.",
      answer: "Start by recording a profile with React DevTools. Analyze components causing frequent commits or long render times. Check for state colocation issues. Implement component splitting, utilize React.memo with customized props comparisons, and memoize expensive computations using useMemo. For heavy lists, apply DOM virtualization."
    },
    {
      question: "What is your approach to structuring layout styling to enable dynamic client-side branding/themes?",
      intention: "Testing knowledge of CSS custom properties, utility scopes, and CSS-in-JS or CSS Modules encapsulation.",
      answer: "I structure theme values as CSS custom variables at the `:root` level. This allows instantly changing themes in runtime simply by switching a class (like `data-theme='dark'`) or mutating properties dynamically in Javascript, avoiding styling rebuilds."
    }
  ],
  behavioralQuestions: [
    {
      question: "Describe a scenario where you had to push back on a design mockup that was not optimized for performance or mobile responsiveness.",
      intention: "Assessing engineering maturity, communication style, and focus on practical user-experience.",
      answer: "I was given a dashboard design featuring multiple overlapping glassmorphism cards and complex SVG animations. I created a fast, responsive prototype showing the frame drops on budget mobile devices. I suggested simplified gradients and CSS animations as alternatives. The designer agreed, and we maintained the premium feel while boosting performance by 40%."
    }
  ],
  preparationPlan: [
    {
      day: 1,
      focus: "Render Profiling and Memoization Patterns",
      tasks: [
        "Read React 19 documentation regarding update batches and compiler changes.",
        "Construct a nested list component with deliberate render lag, profile it, and fix using memoized selectors.",
        "Review state distribution and move shared states closer to target components."
      ]
    },
    {
      day: 2,
      focus: "Testing Workflows & Visual Assertions",
      tasks: [
        "Implement a local testing config with Vitest and React Testing Library.",
        "Write assertions to verify component transitions and modal open/close animations."
      ]
    },
    {
      day: 3,
      focus: "CSS Performance & Variable Mapping",
      tasks: [
        "Refactor global variables to support immediate light/dark transitions.",
        "Eliminate redundant utility files and optimize theme declarations."
      ]
    }
  ]
}

const Home = () => {
  
  
  const { user, handleLogout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const toast = useToast()

  // Form states
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [targetCompany, setTargetCompany] = useState("")
  const [resume, setResume] = useState(null)
  
  // App UI states
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [report, setReport] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  
  // Accordion toggle states (tracks question indexes)
  const [expandedTech, setExpandedTech] = useState({})
  const [expandedBeh, setExpandedBeh] = useState({})
  
  // Timeline checklist progress
  const [completedTasks, setCompletedTasks] = useState({})

  // Ticker for mock AI loading phase
  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev))
      }, 2500)
    } else {
      setLoadingStep(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  const loadingStatuses = [
    "Reading and parsing Resume PDF...",
    "Analyzing target Job Description requirements...",
    "Matching credentials & analyzing critical skill gaps...",
    "Formulating optimal technical questions and 30-day timeline..."
  ]

  // File Upload Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0])
      setErrorMsg("")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        setResume(file)
        setErrorMsg("")
      } else {
        setErrorMsg("Please upload a valid PDF file.")
      }
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setResume(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      toast.showWarning("Job Description is required.")
      setErrorMsg("Job Description is required.")
      return
    }
    if (!resume) {
      toast.showWarning("Please upload your resume PDF.")
      setErrorMsg("Please upload your resume PDF.")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      const formData = new FormData()
      formData.append("resume", resume)
      formData.append("jobDescription", jobDescription)
      formData.append("selfDescription", selfDescription)
      formData.append("targetCompany", targetCompany)

      const response = await api.post('/api/interview', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      if (response.data && response.data.interviewReport) {
        const reportData = response.data.interviewReport
        const id = reportData._id || 'latest'
        toast.showSuccess("Interview report generated successfully!")
        navigate(`/interview/${id}`, { state: { report: reportData } })
      } else {
        const msg = "Failed to generate report details. Please try again."
        setErrorMsg(msg)
        toast.showError(msg)
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || "Network error or invalid server connection."
      setErrorMsg(msg)
      toast.showError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = () => {
    setLoading(true)
    setErrorMsg("")
    setTimeout(() => {
      setLoading(false)
      navigate('/interview/demo', { state: { report: demoReport } })
    }, 2000)
  }

  const handleStartOver = () => {
    setReport(null)
    setJobDescription("")
    setSelfDescription("")
    setResume(null)
    setCompletedTasks({})
    setExpandedTech({})
    setExpandedBeh({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Accordion Toggle
  const toggleTechQuestion = (index) => {
    setExpandedTech(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleBehQuestion = (index) => {
    setExpandedBeh(prev => ({ ...prev, [index]: !prev[index] }))
  }

  // Timeline Task Toggle
  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="app-header">
        <div className="logo-group">
          <img src="/arete_logo.png" alt="Arete Logo" style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }} />
          <h1>Arete<span>.ai</span></h1>
        </div>

        {user && (
          <div className="user-profile">
            <button className="dashboard-link-btn" onClick={() => navigate("/dashboard")} title="View Stats Dashboard">
              Dashboard
            </button>
            <div className="avatar">
              {user.username ? user.username.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="user-meta">
              <span className="welcome">Welcome back,</span>
              <span className="username">{user.username || "User"}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log Out">
              <Icons.Logout />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div className="pulse-orb">
                <Icons.AreteLogo />
              </div>
              <div className="loader-progress-track">
                <div className="loader-progress-bar" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
              </div>
              <h3>Analyzing & Preparing Insights</h3>
              <p className="status-text">{loadingStatuses[loadingStep]}</p>
              <div className="loading-particles">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        {!report ? (
          /* Form Input Screen */
          <div className="form-screen">
            <div className="hero-section">
              <h2>Build the Perfect Interview Strategy</h2>
              <p>
                Get custom-tailored interview preparation. Provide a Job Description and your Resume to see your Match Score, explore detailed Skill Gaps, and access 30 days of customized study timelines.
              </p>
            </div>

            {errorMsg && (
              <div className="error-banner">
                <Icons.Info />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="input-form">
              <div className="grid-layout">
                
                {/* Left Side: Job Description */}
                <div className="form-card left-card">
                  <div className="card-header">
                    <Icons.Sparkles />
                    <h3>Job Description</h3>
                  </div>
                  <div className="textarea-wrapper">
                    <textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description here..."
                      required
                    ></textarea>
                    <div className="textarea-footer">
                      <span>Provide as much detail as possible for better matching</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Resume & Self description */}
                <div className="form-card right-card">
                  <div className="card-header">
                    <Icons.FileText />
                    <h3>Your Profile Details</h3>
                  </div>
                  
                  {/* File Drag and Drop */}
                  <div className="input-group">
                    <label>Resume PDF <span className="required">*</span></label>
                    <div
                      className={`drag-drop-zone ${isDragging ? "dragging" : ""} ${resume ? "has-file" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="resume"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        hidden
                      />
                      
                      {!resume ? (
                        <div className="upload-prompt">
                          <Icons.Upload />
                          <p className="title">Drag & Drop Resume here</p>
                          <p className="subtitle">or click to browse files (PDF only)</p>
                        </div>
                      ) : (
                        <div className="file-badge">
                          <Icons.FileText />
                          <div className="file-info">
                            <p className="file-name">{resume.name}</p>
                            <p className="file-size">
                              {resume.size ? `${(resume.size / 1024).toFixed(1)} KB` : "Document Loaded"}
                            </p>
                          </div>
                          <button className="remove-file" onClick={handleRemoveFile} title="Remove File">
                            <Icons.Trash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Company input */}
                  <div className="input-group">
                    <label htmlFor="targetCompany">Target Company <small className="optional">(Optional)</small></label>
                    <input
                      type="text"
                      id="targetCompany"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google, Amazon, Meta, Netflix or Startup..."
                    />
                  </div>

                  {/* Self description */}
                  <div className="input-group">
                    <label htmlFor="selfDescription">Self Description <small className="optional">(Optional)</small></label>
                    <textarea
                      id="selfDescription"
                      value={selfDescription}
                      onChange={(e) => setSelfDescription(e.target.value)}
                      placeholder="Briefly describe your career goals, key strengths, or any context you want the AI to consider..."
                    ></textarea>
                  </div>

                  {/* Action row */}
                  <div className="action-row">
                    <button type="submit" className="btn btn-primary">
                      <Icons.Sparkles />
                      <span>Generate AI Analysis</span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleLoadDemo}>
                      <span>Try Demo Sandbox</span>
                    </button>
                  </div>

                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Report Dashboard Screen */
          <div className="report-screen">
            
            {/* Top Toolbar */}
            <div className="report-toolbar">
              <button className="btn btn-back" onClick={handleStartOver}>
                <Icons.ArrowLeft />
                <span>Create New Analysis</span>
              </button>
              <div className="target-summary">
                <span className="label">Target Position:</span>
                <span className="val">{report.jobDescription ? report.jobDescription.slice(0, 70) + "..." : "Target Role"}</span>
              </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="dashboard-stats-grid">
              
              {/* Radial Match Score Card */}
              <div className="stat-card score-card">
                <div className="score-wheel">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className="circle"
                      strokeDasharray={`${report.matchScore || 0}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="score-text">
                    <span className="percent">{report.matchScore || 0}%</span>
                    <span className="lbl">Fit Score</span>
                  </div>
                </div>
                <div className="score-feedback">
                  <h4>
                    {report.matchScore >= 80 ? "Excellent Alignment" : report.matchScore >= 60 ? "Moderate Alignment" : "Gaps Detected"}
                  </h4>
                  <p>Your background shows strong technical crossovers with the role specifications, with a few crucial focus areas mapped below.</p>
                </div>
              </div>

              {/* Stat card 2: Skill gaps count */}
              <div className="stat-card generic-stat">
                <div className="stat-value highlight">{(report.skillGaps && report.skillGaps.length) || 0}</div>
                <div className="stat-label">Identified Skill Gaps</div>
                <p className="stat-desc">Areas requiring additional study or experience mapping prior to your conversation.</p>
              </div>

              {/* Stat card 3: Total Questions */}
              <div className="stat-card generic-stat">
                <div className="stat-value">
                  {((report.technicalQuestions && report.technicalQuestions.length) || 0) + 
                   ((report.behavioralQuestions && report.behavioralQuestions.length) || 0)}
                </div>
                <div className="stat-label">Practice Questions Generated</div>
                <p className="stat-desc">Tailored interview queries built to address your gaps and verify core capabilities.</p>
              </div>

            </div>

            {/* Tabs Controller */}
            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-link ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview & Skill Gaps
                </button>
                <button 
                  className={`tab-link ${activeTab === "questions" ? "active" : ""}`}
                  onClick={() => setActiveTab("questions")}
                >
                  Interview Q&A Prep
                </button>
                <button 
                  className={`tab-link ${activeTab === "plan" ? "active" : ""}`}
                  onClick={() => setActiveTab("plan")}
                >
                  30-Day Study Roadmap
                </button>
              </div>

              <div className="tab-pane-content">
                
                {/* TAB 1: OVERVIEW & SKILL GAPS */}
                {activeTab === "overview" && (
                  <div className="pane-overview animate-fade-in">
                    <div className="card-column-layout">
                      
                      <div className="info-intro-card">
                        <h3>Match Overview</h3>
                        <p>Based on the job criteria and your submitted resume, we've parsed out primary skill gaps that will guide your preparation. Pay special attention to <strong>High severity</strong> gaps, as they are likely core filters in initial screening calls.</p>
                        
                        <div className="tips-list">
                          <div className="tip-item">
                            <span className="dot pink"></span>
                            <span><strong>High Severity:</strong> Immediate focus. Core requirements of the job description not present on your resume.</span>
                          </div>
                          <div className="tip-item">
                            <span className="dot yellow"></span>
                            <span><strong>Medium Severity:</strong> Important. Standard requirements that might be asked in technical rounds.</span>
                          </div>
                          <div className="tip-item">
                            <span className="dot green"></span>
                            <span><strong>Low Severity:</strong> Optional. Nice-to-have features or minor tooling adjustments.</span>
                          </div>
                        </div>
                      </div>

                      <div className="gaps-grid-list">
                        {report.skillGaps && report.skillGaps.length > 0 ? (
                          report.skillGaps.map((item, i) => (
                            <div key={i} className={`gap-item-card severity-${item.severity || 'medium'}`}>
                              <div className="gap-badge">{(item.severity || 'medium').toUpperCase()} GAP</div>
                              <h4 className="gap-title">{item.skill}</h4>
                              <p className="gap-advice">Prepare talking points about self-study, adjacent projects, or quick prototypes to demonstrate familiarity.</p>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state">
                            <p>No critical skill gaps identified. You match the profile criteria exceptionally well!</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: INTERVIEW Q&A PREP */}
                {activeTab === "questions" && (
                  <div className="pane-questions animate-fade-in">
                    
                    {/* Technical Questions */}
                    <div className="question-section-block">
                      <div className="section-title-badge">Technical Round Prep</div>
                      <div className="accordion-list">
                        {report.technicalQuestions && report.technicalQuestions.length > 0 ? (
                          report.technicalQuestions.map((q, i) => {
                            const isExpanded = !!expandedTech[i]
                            return (
                              <div key={i} className={`accordion-card ${isExpanded ? "open" : ""}`}>
                                <button className="accordion-toggle" onClick={() => toggleTechQuestion(i)}>
                                  <span className="question-number">Tech Q{i + 1}</span>
                                  <span className="question-text">{q.question}</span>
                                  <Icons.ChevronDown className="chevron" />
                                </button>
                                <div className="accordion-content">
                                  <div className="content-inner">
                                    <div className="intention-box">
                                      <h5><Icons.Info /> Why they ask this (Intention):</h5>
                                      <p>{q.intention}</p>
                                    </div>
                                    <div className="answer-box">
                                      <h5>Suggested High-Score Answer:</h5>
                                      <p>{q.answer}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="empty-msg">No technical questions generated.</p>
                        )}
                      </div>
                    </div>

                    {/* Behavioral Questions */}
                    <div className="question-section-block">
                      <div className="section-title-badge behavioral">Behavioral Round Prep</div>
                      <div className="accordion-list">
                        {report.behavioralQuestions && report.behavioralQuestions.length > 0 ? (
                          report.behavioralQuestions.map((q, i) => {
                            const isExpanded = !!expandedBeh[i]
                            return (
                              <div key={i} className={`accordion-card ${isExpanded ? "open" : ""}`}>
                                <button className="accordion-toggle" onClick={() => toggleBehQuestion(i)}>
                                  <span className="question-number behavioral">Beh Q{i + 1}</span>
                                  <span className="question-text">{q.question}</span>
                                  <Icons.ChevronDown className="chevron" />
                                </button>
                                <div className="accordion-content">
                                  <div className="content-inner">
                                    <div className="intention-box">
                                      <h5><Icons.Info /> Why they ask this (Intention):</h5>
                                      <p>{q.intention}</p>
                                    </div>
                                    <div className="answer-box">
                                      <h5>Suggested High-Score Answer:</h5>
                                      <p>{q.answer}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="empty-msg">No behavioral questions generated.</p>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: 30-DAY STUDY ROADMAP */}
                {activeTab === "plan" && (
                  <div className="pane-plan animate-fade-in">
                    <div className="plan-intro">
                      <h3>30-Day Preparation Syllabus</h3>
                      <p>Check off tasks as you finish them. A highly organized preparation path ensures structural familiarity with the gaps highlighted in this report.</p>
                    </div>

                    <div className="timeline-container">
                      {report.preparationPlan && report.preparationPlan.length > 0 ? (
                        report.preparationPlan.map((dayItem, dIdx) => (
                          <div key={dIdx} className="timeline-day-card">
                            <div className="timeline-marker">
                              <span className="day-bubble">Day {dayItem.day || dIdx + 1}</span>
                            </div>
                            <div className="timeline-content-card">
                              <h4 className="day-focus">{dayItem.focus}</h4>
                              <div className="tasks-checklist">
                                {dayItem.tasks && dayItem.tasks.map((task, tIdx) => {
                                  const isChecked = !!completedTasks[`${dIdx}-${tIdx}`]
                                  return (
                                    <div 
                                      key={tIdx} 
                                      className={`checklist-item ${isChecked ? "completed" : ""}`}
                                      onClick={() => toggleTask(dIdx, tIdx)}
                                    >
                                      <div className="checkbox">
                                        {isChecked && <Icons.CheckCircle />}
                                      </div>
                                      <span className="task-text">{task}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <p>No study roadmap available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}

export default Home

