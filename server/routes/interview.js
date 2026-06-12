const express = require("express")
const requireAuth = require("../middleware/requireAuth")
const asyncHandler = require("../middleware/asyncHandler")
const validate = require("../middleware/validate")
const interviewController = require("../controllers/interview.controller")
const {
  createInterview,
  transcribeAudio,
  completeInterview,
  interviewIdParam,
} = require("../validators/interview.validator")

const router = express.Router()

// All interview routes require authentication.
router.use(requireAuth)

// ── Transcription ─────────────────────────────────────────────────────
router.post(
  "/api/interviews/transcribe",
  validate(transcribeAudio),
  asyncHandler(interviewController.transcribe)
)

// ── CRUD ──────────────────────────────────────────────────────────────
router.post(
  "/api/interviews",
  validate(createInterview),
  asyncHandler(interviewController.create)
)

router.get(
  "/api/interviews",
  asyncHandler(interviewController.list)
)

router.get(
  "/api/interviews/:id",
  validate(interviewIdParam),
  asyncHandler(interviewController.getById)
)

// ── State transitions ─────────────────────────────────────────────────
router.patch(
  "/api/interviews/:id/start",
  validate(interviewIdParam),
  asyncHandler(interviewController.start)
)

router.patch(
  "/api/interviews/:id/complete",
  validate({ ...interviewIdParam, ...completeInterview }),
  asyncHandler(interviewController.complete)
)

// ── Questions ─────────────────────────────────────────────────────────
router.get(
  "/api/interviews/:id/questions",
  validate(interviewIdParam),
  asyncHandler(interviewController.getQuestions)
)

// ── CRUD Deletion ─────────────────────────────────────────────────────
router.delete(
  "/api/interviews/:id",
  validate(interviewIdParam),
  asyncHandler(interviewController.deleteInterview)
)

module.exports = router
