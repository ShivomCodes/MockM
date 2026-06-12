const interviewRepo = require("../repositories/interview.repository")
const {
  generateInterviewQuestions,
  generateFeedback,
  transcribeAudio: transcribeWithGemini,
} = require("../lib/gemini")
const { ConflictError, ExternalServiceError } = require("../errors")

/**
 * Interview business-logic layer.
 *
 * Orchestrates repository calls, AI interactions, and state-machine
 * validation. Throws typed errors — never sends HTTP responses.
 */

/**
 * Create a new interview.
 * @param {string} userId
 * @param {{ role: string, type: string, difficulty: string, duration: number }} data
 */
async function createInterview(userId, { role, type, difficulty, duration }) {
  return interviewRepo.create({ userId, role, type, difficulty, duration })
}

/**
 * List all interviews for a user.
 * @param {string} userId
 */
async function listInterviews(userId) {
  return interviewRepo.findAllByUser(userId)
}

/**
 * Retrieve a single interview (scoped to its owner).
 * @param {string} id
 * @param {string} userId
 */
async function getInterview(id, userId) {
  return interviewRepo.findByIdAndUser(id, userId)
}

/**
 * Transition an interview from "pending" to "in_progress".
 * @param {string} id
 * @param {string} userId
 */
async function startInterview(id, userId) {
  const interview = await interviewRepo.findByIdAndUser(id, userId)

  if (interview.status === "in_progress") {
    return interview
  }

  if (interview.status !== "pending") {
    throw new ConflictError(
      `Cannot start interview — current status is "${interview.status}" (must be "pending")`
    )
  }

  return interviewRepo.markInProgress(id)
}

/**
 * Complete an interview: persist transcript, generate AI feedback, save it.
 * @param {string} id
 * @param {string} userId
 * @param {Array} transcript
 */
async function completeInterview(id, userId, transcript) {
  const interview = await interviewRepo.findByIdAndUser(id, userId)

  if (interview.status !== "in_progress") {
    throw new ConflictError(
      `Cannot complete interview — current status is "${interview.status}" (must be "in_progress")`
    )
  }

  const completedInterview = await interviewRepo.markCompleted(id, transcript)

  try {
    const feedbackResult = await generateFeedback(completedInterview)
    return interviewRepo.saveFeedback(id, feedbackResult)
  } catch (error) {
    // If feedback generation fails, the interview is still marked "completed"
    // with its transcript saved. Throw so the controller can inform the client.
    throw new ExternalServiceError("Gemini (feedback generation)", error.message)
  }
}

/**
 * Generate interview questions for an existing interview.
 * @param {string} id
 * @param {string} userId
 */
async function getQuestions(id, userId) {
  const interview = await interviewRepo.findByIdAndUser(id, userId)

  return generateInterviewQuestions({
    role: interview.role,
    type: interview.type,
    difficulty: interview.difficulty,
    duration: interview.duration,
  })
}

/**
 * Transcribe audio using the AI service.
 * @param {string} audio — base64-encoded audio.
 * @param {string} [mimeType]
 */
async function transcribeAudio(audio, mimeType) {
  return transcribeWithGemini(audio, mimeType)
}

/**
 * Delete an interview.
 * @param {string} id
 * @param {string} userId
 */
async function deleteInterview(id, userId) {
  return interviewRepo.deleteByIdAndUser(id, userId)
}

module.exports = {
  createInterview,
  listInterviews,
  getInterview,
  startInterview,
  completeInterview,
  getQuestions,
  transcribeAudio,
  deleteInterview,
}
