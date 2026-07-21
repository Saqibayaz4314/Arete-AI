import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../../../utils/api";
import { generateInterviewReportPdf } from "../utils/generatePdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import "../style/interview.scss"; // reuse layouts

const Icons = {
  Plus: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
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
  )
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalEvaluatedAnswers: 0,
    averageEvaluationScore: 0,
    chartData: []
  });
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_LIMIT = 5;
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null); // tracks which row PDF is generating

  // Download PDF directly from dashboard row — fetches full report then generates PDF
  const handleDownloadRowPdf = async (itemId) => {
    setDownloadingId(itemId);
    try {
      const res = await axios.get(
        `${API_BASE}/api/interview/report/${itemId}`,
        { withCredentials: true }
      );
      if (res.data?.interviewReport) {
        generateInterviewReportPdf(res.data.interviewReport);
      }
    } catch (err) {
      console.error("Dashboard PDF error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Fetch summary stats (always full dataset — not paginated)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/interview/stats/overview`,
          { withCredentials: true }
        );
        setStats(res.data);
      } catch (err) {
        console.error("Fetch stats error:", err);
        setError("Failed to load statistics. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch paginated history list separately
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/interview?page=${historyPage}&limit=${HISTORY_LIMIT}`,
          { withCredentials: true }
        );
        setHistory(res.data.interviewReports || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [historyPage]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="home-dashboard-container centered-loader">
        <div className="loader-spinner"></div>
        <p>Analyzing preparation metrics...</p>
      </div>
    );
  }

  return (
    <div className="home-dashboard-container animate-fade-in">
      <div className="dashboard-header-row">
        <div>
          <h1>Candidate Progress Dashboard</h1>
          <p className="subtitle">Track your prep scores, practice history, and skill improvements</p>
        </div>
        <button className="button primary-button flex-btn" onClick={() => navigate("/")}>
          <Icons.Plus /> New Arete Session
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Numerical Highlights */}
      <div className="stats-highlights-grid">
        <div className="stat-card">
          <div className="card-icon blue-icon">
            <Icons.Activity />
          </div>
          <div className="stat-info">
            <span className="lbl">Total Mock Interviews</span>
            <span className="val">{stats.totalInterviews}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon green-icon">
            <Icons.CheckCircle />
          </div>
          <div className="stat-info">
            <span className="lbl">Practice Answers Graded</span>
            <span className="val">{stats.totalEvaluatedAnswers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon amber-icon">
            <Icons.Award />
          </div>
          <div className="stat-info">
            <span className="lbl">Average Evaluation Score</span>
            <span className="val">{stats.averageEvaluationScore}%</span>
          </div>
        </div>
      </div>

      {/* Progression Line Chart */}
      {stats.chartData && stats.chartData.length > 0 ? (
        <div className="dashboard-chart-card">
          <h4>Preparation Score Trends</h4>
          <p className="chart-sub">Track your resume fit score vs. mock interview evaluations across sessions</p>
          
          <div className="chart-container" style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart
                data={stats.chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 240, 234, 0.05)" />
                <XAxis 
                  dataKey="createdAt" 
                  tickFormatter={formatDate}
                  stroke="#80766a"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#80766a"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#161311", 
                    borderColor: "rgba(245, 240, 234, 0.08)",
                    borderRadius: "8px",
                    color: "#f5f0ea"
                  }}
                  labelFormatter={(lbl) => new Date(lbl).toLocaleDateString()}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Resume Fit Score"
                  type="monotone"
                  dataKey="fitScore"
                  stroke="#e8823a"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  name="Avg Practice Score"
                  type="monotone"
                  dataKey="averageEvaluationScore"
                  stroke="#8a9a7e"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="dashboard-chart-card empty-card-chart">
          <p>Complete mock question evaluations to visualize score trajectories here.</p>
        </div>
      )}

      {/* History Checklist List */}
      <div className="dashboard-history-section">
        <h3>Arete History</h3>
        
        {historyLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading history...</div>
        ) : history.length > 0 ? (
          <>
            <div className="history-table-list">
              {history.map((item, idx) => (
                <div className="history-row-card" key={item._id || idx}>
                  <div className="row-meta">
                    <h4>{item.title || item.role || "Interview Report"}</h4>
                    <span className="date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="row-scores">
                    <div className="score-badge fit">
                      <span className="num">{item.matchScore ?? "--"}%</span>
                      <span className="lbl">Resume Match</span>
                    </div>
                  </div>

                  <div className="row-actions">
                    <button 
                      onClick={() => navigate(`/interview/${item._id}`, { state: { report: item } })} 
                      className="button action-btn flex-btn"
                    >
                      <Icons.FileText /> Workspace
                    </button>
                    <button 
                      onClick={() => navigate(`/interview/${item._id}/mock`)} 
                      className="button action-btn voice-btn flex-btn"
                    >
                      <Icons.Mic /> Voice Mock
                    </button>
                    <button
                      onClick={() => handleDownloadRowPdf(item._id)}
                      disabled={downloadingId === item._id}
                      className="button action-btn flex-btn"
                      title="Download PDF"
                      style={{
                        color: "var(--accent-primary)",
                        borderColor: "rgba(232,130,58,0.25)",
                        opacity: downloadingId === item._id ? 0.6 : 1,
                        cursor: downloadingId === item._id ? "not-allowed" : "pointer"
                      }}
                    >
                      <Icons.Download />
                      <span>{downloadingId === item._id ? "…" : "PDF"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.2rem",
                marginTop: "1.8rem",
                padding: "0.8rem 1.4rem",
                background: "rgba(18, 14, 11, 0.6)",
                border: "1px solid rgba(232, 130, 58, 0.18)",
                borderRadius: "12px",
                backdropFilter: "blur(8px)"
              }}>
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    fontFamily: "inherit",
                    transition: "all 0.25s ease",
                    background: historyPage <= 1 ? "rgba(22, 19, 17, 0.4)" : "rgba(232, 130, 58, 0.12)",
                    border: historyPage <= 1 ? "1px solid rgba(245, 240, 234, 0.06)" : "1px solid rgba(232, 130, 58, 0.35)",
                    color: historyPage <= 1 ? "rgba(245, 240, 234, 0.25)" : "var(--accent-primary, #e8823a)",
                    cursor: historyPage <= 1 ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={e => { if (historyPage > 1) e.currentTarget.style.background = "rgba(232, 130, 58, 0.22)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = historyPage <= 1 ? "rgba(22, 19, 17, 0.4)" : "rgba(232, 130, 58, 0.12)" }}
                >
                  ← Previous
                </button>

                <span style={{ color: "#b8afa3", fontSize: "0.88rem", fontWeight: "500", letterSpacing: "0.3px" }}>
                  Page <strong style={{ color: "#f5f0ea", fontWeight: "700" }}>{pagination.currentPage}</strong> of <strong style={{ color: "#f5f0ea", fontWeight: "700" }}>{pagination.totalPages}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={historyPage >= pagination.totalPages}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    fontFamily: "inherit",
                    transition: "all 0.25s ease",
                    background: historyPage >= pagination.totalPages ? "rgba(22, 19, 17, 0.4)" : "rgba(232, 130, 58, 0.12)",
                    border: historyPage >= pagination.totalPages ? "1px solid rgba(245, 240, 234, 0.06)" : "1px solid rgba(232, 130, 58, 0.35)",
                    color: historyPage >= pagination.totalPages ? "rgba(245, 240, 234, 0.25)" : "var(--accent-primary, #e8823a)",
                    cursor: historyPage >= pagination.totalPages ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={e => { if (historyPage < pagination.totalPages) e.currentTarget.style.background = "rgba(232, 130, 58, 0.22)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = historyPage >= pagination.totalPages ? "rgba(22, 19, 17, 0.4)" : "rgba(232, 130, 58, 0.12)" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-history-box">
            <p>You haven't generated any interview reports yet.</p>
            <button className="button primary-button" onClick={() => navigate("/")}>
              Start First Preparation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
