const { GoogleGenerativeAI } = require("@google/generative-ai")
const config = require("../config/environment")
const { ExternalServiceError } = require("../errors")

const { apiKey, model: MODEL_NAME } = config.gemini

/**
 * Returns a configured Gemini generative model instance.
 */
function getModel() {
  const client = new GoogleGenerativeAI(apiKey)
  return client.getGenerativeModel({ model: MODEL_NAME })
}

/**
 * Attempt to extract a JSON value from a text response that may
 * contain markdown fences or surrounding prose.
 *
 * @param {string} text
 * @returns {*} Parsed JSON value.
 * @throws {Error} If no valid JSON can be found.
 */
function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty Gemini response")
  }

  const trimmed = text.trim()

  // Fast path — the entire response is valid JSON.
  try {
    return JSON.parse(trimmed)
  } catch {
    // Fall through to heuristic extraction.
  }

  const startArray = trimmed.indexOf("[")
  const startObject = trimmed.indexOf("{")

  let start = -1
  let end = -1

  if (startArray !== -1 && (startObject === -1 || startArray < startObject)) {
    start = startArray
    end = trimmed.lastIndexOf("]")
  } else if (startObject !== -1) {
    start = startObject
    end = trimmed.lastIndexOf("}")
  }

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON found in Gemini response")
  }

  return JSON.parse(trimmed.slice(start, end + 1))
}

/**
 * Hardcoded fallback questions used when Gemini fails to generate.
 */
function fallbackQuestions() {
  return [
    {
      id: 1,
      question:
        "Tell me about a recent project you worked on and the biggest challenge you solved.",
      category: "general",
      followUp:
        "What trade-offs did you consider, and what would you do differently now?",
    },
    {
      id: 2,
      question:
        "How do you approach debugging when a production issue has an unclear root cause?",
      category: "technical",
      followUp:
        "Walk through the exact steps you would take in your first 30 minutes.",
    },
    {
      id: 3,
      question:
        "Describe a time you disagreed with a teammate on a technical decision.",
      category: "behavioral",
      followUp:
        "How did you resolve the disagreement and what was the outcome?",
    },
  ]
}

/**
 * Generate interview questions via Gemini.
 *
 * Falls back to a static set if Gemini fails, so the interview can
 * always proceed.
 *
 * @param {{ role: string, type: string, difficulty: string, duration: number }} params
 * @returns {Promise<Array>}
 */
async function generateInterviewQuestions({ role, type, difficulty, duration }) {
  if (process.env.NODE_ENV === "test") {
    return fallbackQuestions()
  }

  const questionCount = Math.min(Math.max(Math.floor(duration / 3), 3), 8)

  const prompt = `You are an expert technical interviewer at a top tech company.
Generate ${questionCount} interview questions for a ${difficulty} level ${role} position.
Interview type: ${type}.
Return ONLY a valid JSON array with no markdown, no explanation:
[{ "id": 1, "question": "...", "category": "behavioral|technical|general", "followUp": "..." }]`

  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    const text = result?.response?.text()
    const parsed = extractJson(text)

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini question response is not an array")
    }

    return parsed
  } catch (error) {
    console.warn("[Gemini] Question generation failed, using fallback:", error.message)
    return fallbackQuestions()
  }
}

/**
 * Generate interview feedback via Gemini.
 *
 * @param {{ role: string, type: string, difficulty: string, transcript: * }} params
 * @returns {Promise<object>}
 * @throws {ExternalServiceError} If Gemini fails.
 */
async function generateFeedback({ role, type, difficulty, transcript }) {
  if (process.env.NODE_ENV === "test") {
    return {
      overallScore: 82,
      summary: "The candidate demonstrated solid software engineering knowledge and clear communication.",
      strengths: ["Clear structuring of solutions", "Good verbal explanation of trade-offs"],
      improvements: ["Deepen knowledge on database partitioning details"],
      questionFeedback: [
        {
          question: "Mock Question 1",
          score: 8,
          feedback: "Good answer with clear trade-offs mentioned.",
          idealAnswer: "Use architectural patterns and trade-offs."
        }
      ],
      hiringRecommendation: "yes",
      communicationScore: 85,
      technicalScore: 80,
      confidenceScore: 90,
    }
  }

  const prompt = `You are an expert interview coach. Analyze this interview for a ${role} position.
Transcript: ${JSON.stringify(transcript)}
Return ONLY valid JSON with no markdown:
{
  "overallScore": <0-100>,
  "summary": "<2-3 sentence assessment>",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "questionFeedback": [
    { "question": "...", "score": <0-10>, "feedback": "...", "idealAnswer": "..." }
  ],
  "hiringRecommendation": "strong_yes | yes | maybe | no",
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "confidenceScore": <0-100>
}`

  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    const text = result?.response?.text()
    return extractJson(text)
  } catch (error) {
    console.error("[Gemini] Feedback generation failed:", error)
    throw new ExternalServiceError("Gemini (feedback generation)", error.message)
  }
}

/**
 * Transcribe audio using Gemini's multimodal capabilities.
 *
 * @param {string} base64Audio — Base64-encoded audio data.
 * @param {string} [mimeType="audio/webm"]
 * @returns {Promise<string>} Transcribed text.
 * @throws {ExternalServiceError} If transcription fails.
 */
async function transcribeAudio(base64Audio, mimeType) {
  if (process.env.NODE_ENV === "test") {
    return "This is a mock transcription of the audio."
  }

  const prompt =
    "Transcribe the following audio accurately. Return ONLY the spoken text, without any markdown, quotes, or extra explanation. If there is no speech or it is unintelligible, return an empty string."

  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType || "audio/webm",
    },
  }

  try {
    const model = getModel()
    const result = await model.generateContent([prompt, audioPart])
    return result?.response?.text()?.trim() || ""
  } catch (error) {
    console.error("[Gemini] Transcription failed:", error)
    throw new ExternalServiceError("Gemini (transcription)", error.message)
  }
}

module.exports = {
  generateInterviewQuestions,
  generateFeedback,
  transcribeAudio,
}
