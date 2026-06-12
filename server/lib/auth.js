const { betterAuth } = require("better-auth")
const { prismaAdapter } = require("better-auth/adapters/prisma")
const prisma = require("./prisma")
const config = require("../config/environment")

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    config.client.url,
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  secret: config.auth.secret,
  trustHost: true,
})

module.exports = auth
