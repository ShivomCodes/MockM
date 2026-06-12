/**
 * Client-side error infrastructure.
 *
 * Provides a consistent `ApiError` class and a `parseApiError` utility
 * that normalizes Axios errors, server `{ success, error }` responses,
 * and raw errors into a single shape callers can rely on.
 */

export class ApiError extends Error {
  /**
   * @param {string} message — Human-readable error description.
   * @param {number} statusCode — HTTP status code (0 for network errors).
   * @param {*} [details] — Optional extra context from the server.
   */
  constructor(message, statusCode = 0, details = null) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.details = details
    this.isApiError = true
  }
}

/**
 * Normalizes any error into an `ApiError` instance.
 *
 * Handles:
 * - Axios errors with `response.data.error.message` (new server format)
 * - Axios errors with `response.data.error` (legacy string format)
 * - Network errors (no response)
 * - Plain Error instances
 * - String errors
 *
 * @param {*} error — The caught error value.
 * @param {string} [fallback="Something went wrong. Please try again."] — Default message.
 * @returns {ApiError}
 */
export function parseApiError(error, fallback = "Something went wrong. Please try again.") {
  // Already an ApiError — return as-is.
  if (error instanceof ApiError) {
    return error
  }

  // Axios error with a server response.
  if (error?.response) {
    const { status, data } = error.response
    const serverError = data?.error

    // New server format: { success: false, error: { code, message, details } }
    if (serverError && typeof serverError === "object") {
      return new ApiError(
        serverError.message || fallback,
        status,
        serverError.details || null
      )
    }

    // Legacy format: { error: "string message" }
    if (typeof serverError === "string" && serverError.trim()) {
      return new ApiError(serverError, status)
    }

    // Fallback from status text.
    return new ApiError(
      error.response.statusText || fallback,
      status
    )
  }

  // Network error (no response received).
  if (error?.request) {
    return new ApiError(
      "Network error. Please check your connection and try again.",
      0
    )
  }

  // Plain Error instance.
  if (error instanceof Error) {
    return new ApiError(error.message || fallback, 0)
  }

  // String error.
  if (typeof error === "string" && error.trim()) {
    return new ApiError(error, 0)
  }

  // Unknown shape.
  return new ApiError(fallback, 0)
}
