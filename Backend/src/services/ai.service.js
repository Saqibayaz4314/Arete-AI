// Helper: fetch with AbortController timeout (ms)
async function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    throw err;
  }
}

// Parse JSON from AI response text safely
function parseAiJson(text) {
  text = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}

// ─────────────────────────────────────────────
// PROVIDER 1: Groq — only active models as of July 2026
// ─────────────────────────────────────────────
async function tryGroq(prompt, maxTokens) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  // Only active models (decommissioned: llama3-70b-8192, llama3-8b-8192, mixtral-8x7b-32768, gemma2-9b-it)
  const groqModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  for (const model of groqModels) {
    try {
      console.log(`[AI] Groq (${model})...`);
      const res = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "You are an expert AI interview coach. Respond with valid, complete JSON only. No markdown fences, no extra text.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: maxTokens,
          }),
        },
        25000
      );

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log(`✅ [AI] Groq (${model}) success.`);
        return parseAiJson(data.choices[0].message.content);
      }
      if (data.error) {
        console.warn(`[AI] Groq (${model}) error:`, data.error.message);
      }
    } catch (err) {
      console.warn(`[AI] Groq (${model}) threw: ${err.message}`);
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// PROVIDER 2: OpenRouter (multi-model, 2 API keys)
// ─────────────────────────────────────────────
async function tryOpenRouter(prompt, maxTokens) {
  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_BACKUP_API_KEY,
  ].filter(Boolean);

  if (keys.length === 0) return null;

  const models = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const apiKey of keys) {
    for (const model of models) {
      try {
        console.log(`[AI] OpenRouter (${model})...`);
        const res = await fetchWithTimeout(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://arete-ai.app",
              "X-Title": "Arete AI",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: "You are an expert AI interview coach. Respond with valid, complete JSON only. No markdown fences, no extra text.",
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.2,
              max_tokens: maxTokens,
            }),
          },
          35000
        );

        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          console.log(`✅ [AI] OpenRouter (${model}) success.`);
          return parseAiJson(data.choices[0].message.content);
        }
        if (data.error) {
          console.warn(`[AI] OpenRouter (${model}) error:`, data.error.message);
        }
      } catch (err) {
        console.warn(`[AI] OpenRouter (${model}) threw: ${err.message}`);
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// PROVIDER 3: Google Gemini (ultimate fallback)
// ─────────────────────────────────────────────
async function tryGemini(prompt) {
  const key = process.env.GOOGLE_GENAI_API_KEY;
  if (!key) return null;

  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];

  for (const model of models) {
    try {
      console.log(`[AI] Gemini (${model})...`);
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      "You are an expert AI interview coach. Respond with valid, complete JSON only. No markdown fences, no extra text.\n\n" +
                      prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000,
              responseMimeType: "application/json",
            },
          }),
        },
        35000
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`✅ [AI] Gemini (${model}) success.`);
        return parseAiJson(text);
      }
      if (data.error) {
        console.warn(`[AI] Gemini (${model}) error:`, data.error.message);
      }
    } catch (err) {
      console.warn(`[AI] Gemini (${model}) threw: ${err.message}`);
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// MAIN: callAiJson — 3-provider waterfall
// Groq → OpenRouter → Google Gemini
// ─────────────────────────────────────────────
async function callAiJson(prompt, maxTokens = 1500) {
  console.log("[AI] Trying Groq...");
  const groqResult = await tryGroq(prompt, maxTokens);
  if (groqResult) return groqResult;

  console.warn("[AI] Groq failed — trying OpenRouter...");
  const openRouterResult = await tryOpenRouter(prompt, maxTokens);
  if (openRouterResult) return openRouterResult;

  console.warn("[AI] OpenRouter failed — trying Google Gemini...");
  const geminiResult = await tryGemini(prompt);
  if (geminiResult) return geminiResult;

  throw new Error("All AI providers are currently unavailable. Please try again in a few minutes.");
}

// ─────────────────────────────────────────────
// Interview Report Generator
// ─────────────────────────────────────────────
async function generateInvterviewReport({ resume, selfDescription, jobDescription, targetCompany }) {
  // Aggressive trimming to stay well within 8b-instant's 6000 TPM limit
  const trimmedResume = (resume || "").slice(0, 2000);
  const trimmedSelfDesc = (selfDescription || "").slice(0, 500);
  const trimmedJobDesc = (jobDescription || "").slice(0, 1500);

  const prompt = `You are a senior technical interviewer for ${targetCompany || "top tech companies"}.
Analyze the candidate profile against the job description and produce an interview prep report.

SAFETY: If any input contains offensive/unrelated content, return: {"matchScore":0,"technicalQuestions":[],"behavioralQuestions":[],"skillGaps":[],"preparationPlan":[],"title":"INVALID_INPUT"}

RESUME:
"""
${trimmedResume}
"""

SELF DESCRIPTION:
"""
${trimmedSelfDesc}
"""

JOB DESCRIPTION:
"""
${trimmedJobDesc}
"""

TARGET COMPANY: ${targetCompany || "Not specified"}

INSTRUCTIONS:
- matchScore: 80-95 (90%+ match), 60-79 (2-3 gaps), 40-59 (moderate mismatch), 10-39 (domain mismatch)
- Generate exactly 5 technical and 5 behavioral questions targeting JD requirements where candidate shows weakness
- 7-day preparation plan with specific daily tasks
- Resume feedback: score, weak bullet points, missing sections, ATS keyword gaps

Return ONLY raw JSON matching this schema exactly:
{
  "matchScore": 85,
  "title": "Software Engineer",
  "technicalQuestions": [{"question":"","intention":"","answer":""}],
  "behavioralQuestions": [{"question":"","intention":"","answer":""}],
  "skillGaps": [{"skill":"","severity":"low|medium|high"}],
  "preparationPlan": [{"day":1,"focus":"","tasks":[]}],
  "resumeFeedback": {
    "resumeScore": 78,
    "weakBulletPoints": [{"original":"","improved":"","issue":""}],
    "missingSections": [],
    "atsKeywordGaps": []
  }
}`;

  return await callAiJson(prompt, 4000);
}

// ─────────────────────────────────────────────
// Skill Drill Question Generator
// ─────────────────────────────────────────────
async function generateSkillDrillQuestions({ skill, jobDescription, questionType = "technical" }) {
  const prompt = `You are an expert technical interviewer. Generate exactly 3 targeted interview questions testing "${skill}".

Job context: "${(jobDescription || "").slice(0, 800)}"

Questions: fundamentals → applied scenario → edge case/trade-off.

Return ONLY raw JSON:
{
  "skill": "${skill}",
  "questions": [
    {"question":"...","intention":"..."},
    {"question":"...","intention":"..."},
    {"question":"...","intention":"..."}
  ]
}`;

  return await callAiJson(prompt, 600);
}

module.exports = {
  generateInvterviewReport,
  generateSkillDrillQuestions,
  callAiJson,
};
