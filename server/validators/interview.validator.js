/**
 * Validation schemas for interview endpoints.
 *
 * Each export is an object with optional `body` / `params` / `query`
 * validator functions, compatible with the `validate()` middleware.
 */

const VALID_TYPES = ["technical", "behavioral", "mixed", "system-design"]
const VALID_DIFFICULTIES = ["easy", "medium", "hard", "junior", "mid", "senior", "lead", "staff"]

// ── Helpers ───────────────────────────────────────────────────────────

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0
}

function isPositiveInt(value) {
  return Number.isInteger(value) && value > 0
}

// ── Schemas ───────────────────────────────────────────────────────────

const createInterview = {
  body(data) {
    const errors = []

    if (!isNonEmptyString(data.role)) {
      errors.push("'role' is required and must be a non-empty string")
    }
    if (!isNonEmptyString(data.type) || !VALID_TYPES.includes(data.type)) {
      errors.push(
        `'type' must be one of: ${VALID_TYPES.join(", ")}`
      )
    }
    if (
      !isNonEmptyString(data.difficulty) ||
      !VALID_DIFFICULTIES.includes(data.difficulty)
    ) {
      errors.push(
        `'difficulty' must be one of: ${VALID_DIFFICULTIES.join(", ")}`
      )
    }
    if (!isPositiveInt(data.duration)) {
      errors.push("'duration' must be a positive integer (minutes)")
    }

    return { valid: errors.length === 0, errors }
  },
}

const transcribeAudio = {
  body(data) {
    const errors = []

    if (!isNonEmptyString(data.audio)) {
      errors.push("'audio' is required and must be a non-empty base64 string")
    }
    if (data.mimeType !== undefined && !isNonEmptyString(data.mimeType)) {
      errors.push("'mimeType' must be a non-empty string when provided")
    }

    return { valid: errors.length === 0, errors }
  },
}

const completeInterview = {
  body(data) {
    const errors = []

    if (!Array.isArray(data.transcript)) {
      errors.push("'transcript' is required and must be an array")
    }

    return { valid: errors.length === 0, errors }
  },
}

const interviewIdParam = {
  params(data) {
    const errors = []

    if (!isNonEmptyString(data.id)) {
      errors.push("'id' parameter is required")
    }

    return { valid: errors.length === 0, errors }
  },
}

module.exports = {
  createInterview,
  transcribeAudio,
  completeInterview,
  interviewIdParam,
}
