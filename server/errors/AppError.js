/**
 * Base application error class.
 *
 * All operational errors thrown in the app should extend this class.
 * The global error handler uses `isOperational` to distinguish expected
 * business errors from unexpected programming bugs.
 */
class AppError extends Error {
  /**
   * @param {string} message  — Human-readable error description.
   * @param {number} statusCode — HTTP status code to respond with.
   * @param {object} [options]
   * @param {boolean} [options.isOperational=true] — `true` for expected errors, `false` for bugs.
   * @param {*} [options.details] — Optional extra context (validation fields, etc.).
   */
  constructor(message, statusCode, { isOperational = true, details = null } = {}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    // Capture a clean stack trace (omits the constructor frame).
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
