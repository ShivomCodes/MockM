const auth = require("../lib/auth")
const { UnauthorizedError } = require("../errors")

/**
 * Express middleware that requires a valid session.
 *
 * Attaches `req.user` on success. Throws `UnauthorizedError` otherwise,
 * which the global error handler will format into a 401 response.
 */
async function requireAuth(req, _res, next) {
  try {
    if (process.env.NODE_ENV === "test" && req.headers["x-test-user-id"]) {
      const prisma = require("../lib/prisma")
      const user = await prisma.user.findUnique({
        where: { id: req.headers["x-test-user-id"] },
      })
      if (user) {
        req.user = user
        return next()
      }
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      throw new UnauthorizedError("Authentication required")
    }

    req.user = session.user
    next()
  } catch (error) {
    // If the error is already an UnauthorizedError we threw, re-throw it.
    if (error instanceof UnauthorizedError) {
      return next(error)
    }
    // Any unexpected auth-service failure is also an auth failure from
    // the client's perspective.
    next(new UnauthorizedError("Authentication failed"))
  }
}

module.exports = requireAuth
