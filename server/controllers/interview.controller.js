const interviewService = require("../services/interview.service")

/**
 * Interview HTTP controller.
 *
 * Thin layer — extracts data from the request, delegates to the
 * service, and sends a consistent JSON response. All methods are
 * wrapped with `asyncHandler` at the route level, so no try/catch
 * is needed here.
 */

/** POST /api/interviews/transcribe */
async function transcribe(req, res) {
  const { audio, mimeType } = req.body
  const text = await interviewService.transcribeAudio(audio, mimeType)
  res.json({ success: true, data: { text } })
}

/** POST /api/interviews */
async function create(req, res) {
  const { role, type, difficulty, duration } = req.body
  const interview = await interviewService.createInterview(req.user.id, {
    role,
    type,
    difficulty,
    duration,
  })
  res.status(201).json({ success: true, data: interview })
}

/** GET /api/interviews */
async function list(req, res) {
  const interviews = await interviewService.listInterviews(req.user.id)
  res.json({ success: true, data: interviews })
}

/** GET /api/interviews/:id */
async function getById(req, res) {
  const interview = await interviewService.getInterview(
    req.params.id,
    req.user.id
  )
  res.json({ success: true, data: interview })
}

/** PATCH /api/interviews/:id/start */
async function start(req, res) {
  const interview = await interviewService.startInterview(
    req.params.id,
    req.user.id
  )
  res.json({ success: true, data: interview })
}

/** PATCH /api/interviews/:id/complete */
async function complete(req, res) {
  const { transcript } = req.body
  const interview = await interviewService.completeInterview(
    req.params.id,
    req.user.id,
    transcript
  )
  res.json({ success: true, data: interview })
}

/** GET /api/interviews/:id/questions */
async function getQuestions(req, res) {
  const questions = await interviewService.getQuestions(
    req.params.id,
    req.user.id
  )
  res.json({ success: true, data: questions })
}

/** DELETE /api/interviews/:id */
async function deleteInterview(req, res) {
  await interviewService.deleteInterview(
    req.params.id,
    req.user.id
  )
  res.json({ success: true, message: "Interview deleted successfully" })
}

module.exports = {
  transcribe,
  create,
  list,
  getById,
  start,
  complete,
  getQuestions,
  deleteInterview,
}
