const { AppError } = require("../errors")

/**
 * Global error-handling middleware.
 *
 * Must be registered **after** all routes. Express recognises the
 * 4-argument signature `(err, req, res, next)` as an error handler.
 *
 * Response shape (always):
 *   { success: false, error: { code, message, details? } }
 */
function errorHandler(err, _req, res, _next) {
  // ── Determine status & message ──────────────────────────────────────
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal server error"
  let details = err.details || null

  // For non-operational (unexpected) errors, hide internals in production.
  if (!(err instanceof AppError) || !err.isOperational) {
    console.error("[UNEXPECTED ERROR]", err)
    statusCode = 500
    message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error"
    details = null
  } else {
    // Operational errors — safe to log at warn level.
    console.warn(`[${err.name}] ${err.message}`)
  }

  // ── Send response ───────────────────────────────────────────────────
  const body = {
    success: false,
    error: {
      code: statusCode,
      message,
    },
  }

  if (details) {
    body.error.details = details
  }

  res.status(statusCode).json(body)
}

module.exports = errorHandler
