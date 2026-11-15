const express = require("express")
const cors = require("cors")
const { toNodeHandler } = require("better-auth/node")

const config = require("./config/environment")
const auth = require("./lib/auth")
const prisma = require("./lib/prisma")
const routes = require("./routes")
const errorHandler = require("./middleware/errorHandler")
const { NotFoundError } = require("./errors")

const app = express()

// ── Global middleware ─────────────────────────────────────────────────
// CORS must come first: browsers send a preflight OPTIONS request for
// cross-origin auth calls (signup/login) — without it fetch fails.
app.use(
  cors({
    origin: [
      config.client.url,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)
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
