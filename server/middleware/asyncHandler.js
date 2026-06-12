/**
 * Wraps an async Express handler so that any rejected promise is
 * automatically forwarded to `next(error)`.
 *
 * Usage:
 *   router.get("/path", asyncHandler(async (req, res) => { … }))
 *
 * @param {Function} fn — Async request handler (req, res, next) => Promise.
 * @returns {Function} Standard Express middleware.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = asyncHandler
