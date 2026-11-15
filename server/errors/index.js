const AppError = require("./AppError")

class ValidationError extends AppError {
  /** @param {string} message @param {*} [details] */
  constructor(message = "Validation failed", details = null) {
    super(message, 400, { details })
  }
}

class UnauthorizedError extends AppError {
  /** @param {string} message */
  constructor(message = "Unauthorized") {
    super(message, 401)
  }
}

class ForbiddenError extends AppError {
  /** @param {string} message */
  constructor(message = "Forbidden") {
    super(message, 403)
  }
}

class NotFoundError extends AppError {
  /** @param {string} resource */
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404)
  }
}

class ConflictError extends AppError {
  /** @param {string} message */
  constructor(message = "Conflict") {
    super(message, 409)
  }
}

class ExternalServiceError extends AppError {
  /** @param {string} service — Name of the failing service (e.g. "Gemini"). */
  constructor(service = "External service", details = null) {
    super(`${service} request failed`, 502, { details })
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ExternalServiceError,
}
