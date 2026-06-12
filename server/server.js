const express = require("express")
const { toNodeHandler } = require("better-auth/node")

const config = require("./config/environment")
const auth = require("./lib/auth")
const prisma = require("./lib/prisma")
const routes = require("./routes")
const errorHandler = require("./middleware/errorHandler")
const { NotFoundError } = require("./errors")

const app = express()

// ── Global middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }))

// ── Health check ──────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date() } })
})

// ── Auth handler (better-auth) ────────────────────────────────────────
app.all("/api/auth/*authPath", toNodeHandler(auth))

// ── Application routes ────────────────────────────────────────────────
app.use(routes)

// ── 404 catch-all for undefined routes ────────────────────────────────
app.use((req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`))
})

// ── Global error handler (must be last) ───────────────────────────────
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────
let server
if (require.main === module) {
  server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
}

// ── Graceful shutdown ─────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully…`)
  const disconnectDb = async () => {
    await prisma.$disconnect()
    console.log("Database disconnected. Goodbye.")
    process.exit(0)
  }

  if (server) {
    server.close(disconnectDb)
  } else {
    disconnectDb()
  }

  // Force exit after 10 seconds if graceful shutdown stalls.
  setTimeout(() => {
    console.error("Shutdown timed out — forcing exit.")
    process.exit(1)
  }, 10_000)
}

if (require.main === module) {
  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT", () => shutdown("SIGINT"))
}

module.exports = { app, server }
