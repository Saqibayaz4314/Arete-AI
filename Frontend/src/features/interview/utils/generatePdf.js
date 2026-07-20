import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Arete brand colors
const ACCENT   = [232, 130, 58]   // #e8823a  — Burnt Amber
const RUST     = [198, 93,  46]   // #c65d2e  — Rust
const DARK_BG  = [15,  13,  11]   // #0f0d0b  — Charcoal
const DARK_ALT = [28,  23,  19]   // section bg
const OFF_WHITE = [245, 240, 234] // #f5f0ea
const MUTED    = [140, 130, 120]  // muted text
const SEV_HIGH  = [184, 69,  58]
const SEV_MED   = [217, 164, 65]
const SEV_LOW   = [138, 154, 126]

const PAGE_W  = 595  // A4 pt
const PAGE_H  = 842
const MARGIN  = 45
const CONTENT_W = PAGE_W - MARGIN * 2

/** Draw a filled rectangle */
function fillRect(doc, x, y, w, h, color) {
  doc.setFillColor(...color)
  doc.rect(x, y, w, h, "F")
}

/** Sanitize a string for safe use in the PDF filename */
function safeFilename(str) {
  return (str || "interview-report")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80)
}

/**
 * Main export function.
 * @param {object} report  - The interviewReport object from the backend/state
 */
export function generateInterviewReportPdf(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })

  // Paint the first page dark background
  fillRect(doc, 0, 0, PAGE_W, PAGE_H, DARK_BG)

  // Override addPage to automatically paint dark background on all subsequent pages
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function(...args) {
    const result = originalAddPage(...args);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, DARK_BG);
    return result;
  };

  // ─── COVER / HEADER BAND ───────────────────────────────────────────────────
  fillRect(doc, 0, 0, PAGE_W, 110, DARK_BG)

  // Brand wordmark
  doc.setFontSize(11)
  doc.setTextColor(...ACCENT)
  doc.setFont("helvetica", "bold")
  doc.text("Arete", MARGIN, 38)
  const areteW = doc.getTextWidth("Arete")
  doc.setTextColor(...OFF_WHITE)
  doc.text(".ai", MARGIN + areteW, 38)

  // Date top-right
  const dateStr = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated ${dateStr}`, PAGE_W - MARGIN, 38, { align: "right" })

  // Report title
  doc.setFontSize(22)
  doc.setTextColor(...OFF_WHITE)
  doc.setFont("helvetica", "bold")
  const title = report.title && report.title !== "INVALID_INPUT"
    ? report.title
    : "Interview Preparation Report"
  doc.text(title, MARGIN, 72)

  // Accent underline
  fillRect(doc, MARGIN, 80, Math.min(doc.getTextWidth(title), CONTENT_W), 2, ACCENT)

  // ─── MATCH SCORE BADGE ────────────────────────────────────────────────────
  // Dark card immediately below header
  fillRect(doc, 0, 110, PAGE_W, 60, DARK_ALT)

  const score = report.matchScore ?? 0
  const scoreColor = score >= 75 ? [138, 154, 126] : score >= 50 ? ACCENT : SEV_HIGH

  doc.setFontSize(28)
  doc.setTextColor(...scoreColor)
  doc.setFont("helvetica", "bold")
  doc.text(`${score}%`, MARGIN, 152)

  const scoreNumW = doc.getTextWidth(`${score}%`)
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont("helvetica", "normal")
  doc.text("Resume Match Score", MARGIN + scoreNumW + 8, 152)

  // Skill gaps count
  const gapsCount = (report.skillGaps || []).length
  const gapsX = MARGIN + scoreNumW + 140
  doc.setFontSize(28)
  doc.setTextColor(...ACCENT)
  doc.setFont("helvetica", "bold")
  doc.text(`${gapsCount}`, gapsX, 152)
  const gapsNumW = doc.getTextWidth(`${gapsCount}`)
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont("helvetica", "normal")
  doc.text("Skill Gaps Identified", gapsX + gapsNumW + 8, 152)

  // Total questions
  const totalQ = (report.technicalQuestions || []).length + (report.behavioralQuestions || []).length
  const qX = gapsX + gapsNumW + 155
  doc.setFontSize(28)
  doc.setTextColor(...OFF_WHITE)
  doc.setFont("helvetica", "bold")
  doc.text(`${totalQ}`, qX, 152)
  const qNumW = doc.getTextWidth(`${totalQ}`)
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont("helvetica", "normal")
  doc.text("Practice Questions", qX + qNumW + 8, 152)

  let y = 190

  // ─── HELPER: section title ─────────────────────────────────────────────────
  function sectionTitle(label, accentLine = true) {
    if (y > PAGE_H - 120) { doc.addPage(); y = 50 }
    doc.setFontSize(13)
    doc.setTextColor(...OFF_WHITE)
    doc.setFont("helvetica", "bold")
    doc.text(label, MARGIN, y)
    if (accentLine) {
      fillRect(doc, MARGIN, y + 4, 28, 2, ACCENT)
    }
    y += 22
  }

  // ─── AUTO TABLE DEFAULTS ───────────────────────────────────────────────────
  const tableDefaults = {
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize: 8,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      overflow: "linebreak",
      textColor: [200, 190, 180],
      lineColor: [40, 35, 30],
      lineWidth: 0.3,
      fillColor: [22, 19, 16],
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [28, 24, 20],
    },
  }

  // ─── TECHNICAL QUESTIONS ───────────────────────────────────────────────────
  sectionTitle("Technical Questions")

  const techBody = (report.technicalQuestions || []).map((q, i) => [
    `T${i + 1}. ${q.question || ""}`,
    q.intention || "",
    q.answer || "",
  ])

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Question", "What's Being Tested", "Model Answer Outline"]],
    body: techBody.length > 0 ? techBody : [["No technical questions generated.", "", ""]],
    columnStyles: {
      0: { cellWidth: 148, fontStyle: "bold", textColor: OFF_WHITE },
      1: { cellWidth: 130 },
      2: { cellWidth: "auto" },
    },
  })
  y = doc.lastAutoTable.finalY + 28

  // ─── BEHAVIORAL QUESTIONS ──────────────────────────────────────────────────
  sectionTitle("Behavioral Questions")

  const behBody = (report.behavioralQuestions || []).map((q, i) => [
    `B${i + 1}. ${q.question || ""}`,
    q.intention || "",
    q.answer || "",
  ])

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Question", "What's Being Tested", "Model Answer Outline"]],
    body: behBody.length > 0 ? behBody : [["No behavioral questions generated.", "", ""]],
    columnStyles: {
      0: { cellWidth: 148, fontStyle: "bold", textColor: OFF_WHITE },
      1: { cellWidth: 130 },
      2: { cellWidth: "auto" },
    },
  })
  y = doc.lastAutoTable.finalY + 28

  // ─── SKILL GAPS ────────────────────────────────────────────────────────────
  sectionTitle("Identified Skill Gaps")

  const gapBody = (report.skillGaps || []).map(g => [
    g.skill || "",
    (g.severity || "medium").toUpperCase(),
  ])

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Skill / Technology", "Severity"]],
    body: gapBody.length > 0 ? gapBody : [["No skill gaps identified.", ""]],
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold", textColor: OFF_WHITE },
      1: { cellWidth: 80, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const sev = (data.cell.raw || "").toLowerCase()
        if (sev === "high")   data.cell.styles.textColor = SEV_HIGH
        else if (sev === "medium") data.cell.styles.textColor = SEV_MED
        else data.cell.styles.textColor = SEV_LOW
        data.cell.styles.fontStyle = "bold"
      }
    },
  })
  y = doc.lastAutoTable.finalY + 28

  // ─── 7-DAY PREPARATION PLAN ────────────────────────────────────────────────
  sectionTitle("7-Day Preparation Plan")

  const planBody = (report.preparationPlan || []).map(p => [
    `Day ${p.day || ""}`,
    p.focus || "",
    (p.tasks || []).map((t, i) => `${i + 1}. ${t}`).join("\n"),
  ])

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [["Day", "Focus Theme", "Action Items"]],
    body: planBody.length > 0 ? planBody : [["—", "No preparation plan generated.", ""]],
    columnStyles: {
      0: { cellWidth: 45, halign: "center", fontStyle: "bold", textColor: ACCENT },
      1: { cellWidth: 130, fontStyle: "bold", textColor: OFF_WHITE },
      2: { cellWidth: "auto" },
    },
  })
  y = doc.lastAutoTable.finalY + 28

  // ─── RESUME FEEDBACK ANALYSIS ──────────────────────────────────────────────
  if (report.resumeFeedback) {
    const fb = report.resumeFeedback
    sectionTitle(`AI Resume Improvement Suggestions (Quality Score: ${fb.resumeScore || 0}%)`)

    const bulletBody = (fb.weakBulletPoints || []).map(b => [
      b.original || "",
      b.improved || "",
      b.issue || ""
    ])

    if (bulletBody.length > 0) {
      autoTable(doc, {
        ...tableDefaults,
        startY: y,
        head: [["Original Weak Bullet", "Improved Version", "Issue Identified"]],
        body: bulletBody,
        columnStyles: {
          0: { cellWidth: 150, textColor: SEV_HIGH },
          1: { cellWidth: 190, fontStyle: "bold", textColor: OFF_WHITE },
          2: { cellWidth: "auto", textColor: MUTED }
        }
      })
      y = doc.lastAutoTable.finalY + 16
    }

    const missingStr = (fb.missingSections || []).join(", ") || "None"
    const atsStr = (fb.atsKeywordGaps || []).join(", ") || "None"

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [["Category", "Details / Missing Elements"]],
      body: [
        ["Missing Recommended Sections", missingStr],
        ["ATS Keyword Gaps (Missing JD Tech)", atsStr]
      ],
      columnStyles: {
        0: { cellWidth: 180, fontStyle: "bold", textColor: ACCENT },
        1: { cellWidth: "auto", textColor: OFF_WHITE }
      }
    })
    y = doc.lastAutoTable.finalY + 28
  }

  // ─── FOOTER ON EVERY PAGE ─────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    // Bottom bar
    fillRect(doc, 0, PAGE_H - 30, PAGE_W, 30, DARK_BG)
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.setFont("helvetica", "normal")
    doc.text("Arete — AI Interview Coach", MARGIN, PAGE_H - 11)
    doc.setTextColor(...ACCENT)
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 11, { align: "right" })
  }

  // ─── SAVE ──────────────────────────────────────────────────────────────────
  const filename = safeFilename(title)
  doc.save(`${filename}.pdf`)
}
