/**
 * Centralized environment configuration.
 *
 * Reads all required env vars once, validates them, and exports
 * a frozen config object. Import this instead of reading `process.env`
 * directly — the app will fail fast at startup if anything is missing.
 */
require("dotenv").config()

const requiredVars = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "CLIENT_URL",
]

const missing = requiredVars.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(
    `\n[FATAL] Missing required environment variables:\n  ${missing.join("\n  ")}\n`
  )
  process.exit(1)
}

// At least one Gemini key must be present.
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!geminiApiKey) {
  console.error(
    "\n[FATAL] Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.\n"
  )
  process.exit(1)
}

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  database: Object.freeze({
    url: process.env.DATABASE_URL,
  }),

  auth: Object.freeze({
    secret: process.env.BETTER_AUTH_SECRET,
    url: process.env.BETTER_AUTH_URL,
  }),

  client: Object.freeze({
    url: process.env.CLIENT_URL,
  }),

  gemini: Object.freeze({
    apiKey: geminiApiKey,
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"
  }),
})

module.exports = config
