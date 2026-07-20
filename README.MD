# GenAI Coach — AI Interview Prep & Coaching Platform

GenAI Coach is a comprehensive, interactive MERN-stack application designed to help candidates prepare for highly competitive tech job interviews. Moving beyond static AI generators, it provides real-time written and spoken answer evaluations, progress analytics, company-specific calibration, and browser-native voice simulation.

---

## 🚀 Key Features

### 1. Match Analysis & Prep Plan
- **Resume Parsing**: Direct upload and text parsing of PDF resumes.
- **Intelligent Matching**: Generates a fit score between user profiles and target Job Descriptions.
- **Structured Roadmap**: Automatically creates a day-by-day practice timeline targeting highlighted gaps.

### 2. Company-Specific Calibration
- **Target Company Profiles**: Adapts interview questions and scoring rubrics dynamically.
- **Calibrated Styles**: Emphasizes Data Structures & Algorithms for Google, Leadership Principles (LP) for Amazon, rapid architecture and execution for Meta, and quick adaptability for startups.

### 3. Written & Spoken Answer Evaluation
- **Micro-Grading**: Scores answers from 0-100 on Clarity, Structure (e.g. STAR method compliance), and Depth.
- **Constructive Feedback**: Highlights strengths, critical gaps, and actionable improvement items.
- **Alternative Formulations**: Suggests rewritten high-score responses custom-tailored to the user's personal context.

### 4. Live Voice Mock Interview Simulator
- **Text-to-Speech (TTS)**: Synthesizes prompts using browser-native speech voices to simulate real-time call environments.
- **Speech-to-Text (STT)**: Transcribes spoken responses with continuous microphone tracking in Chrome.
- **Sequential Console**: Orchestrates sequential mock interviews (5 questions) ending with a performance summary dashboard.

### 5. Interactive Progress Dashboard
- **Performance Trends**: Visualizes match scores over time using Recharts area charts.
- **Metrics Cards**: Displays statistics on interviews taken, average score improvements, and most common skill gaps.
- **Interview History**: Re-accesses and manages past interview sessions and scorecards.

---

## 🎨 Design System — "Warm Ember"
Designed with a distinct, premium, non-generic dark palette representing confidence and professional warmth:
*   **Base Background**: `#0f0d0b` (Warm near-black with brown undertones)
*   **Card Surface**: `#1a1613` (Slightly elevated warm charcoal)
*   **Accent Color**: `#e8823a` to `#c65d2e` (Burnt amber/copper to rust gradient)
*   **Text colors**: `#f5f0ea` (Warm off-white primary) and `#b8afa3` (Muted warm secondary)
*   **Semantic states**: Muted Sage `#8a9a7e` (Success), Muted Gold `#d9a441` (Warning), and Deep Brick Red `#b8453a` (High severity)

---

## 🧠 AI Integration Details

The platform integrates the **Gemini 3 Flash** model (`gemini-3-flash-preview`) via the `@google/genai` SDK.

### 1. Interview Generation System Prompt
```text
You are a senior technical interviewer specialized in calibration for [Target Company].
Calibrate all questions to the known culture, tech stacks, values, and interview rubrics of [Target Company].
For example, if Google is target, emphasize data structures & algorithms and open-ended design. If Amazon, align behavioral questions to Leadership Principles (LP).
```

### 2. Answer Evaluation System Prompt
```text
You are an expert interview coach evaluating a candidate's spoken/written answer to an interview question.
Evaluate the answer and return strict JSON containing score, clarityScore, structureScore, depthScore, strengths, improvements, missingPoints, and rewrittenExample.
Rules:
- Be honest and specific. Reference specific phrases from their answer when giving feedback.
- For behavioral answers, verify if they followed the STAR method.
- If the answer is empty or nonsensical, score should be low (0-20) and suggest improvements directly.
```

---

## 🛠️ Technology Stack

*   **Frontend**: React, React Router Dom, Recharts, SCSS, Axios, Vite.
*   **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), `@google/genai`, `pdf-parse`.
*   **Security**: JWT Session Authentication, HttpOnly Cookies.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster
- Google GenAI API Key

### Backend Setup
1. Navigate to the server folder:
   ```bash
   cd Backend
   ```
2. Create your `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```
3. Install dependencies and start server:
   ```bash
   npm install
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../Frontend
   ```
2. Create your `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
3. Install dependencies and start client:
   ```bash
   npm install
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.
