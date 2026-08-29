import { createApp } from "./app"
import { allowedOrigins } from "./config/cors"
import { env } from "./config/env"

/**
 * Process entry point.
 *
 * Importing `./config/env` validates the environment before anything else runs;
 * a missing or malformed required variable exits the process here rather than
 * surfacing as a runtime failure later (docs/25 §3).
 */
const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`[server] ${env.NODE_ENV} — listening on http://localhost:${env.PORT}`)
  console.log(`[server] CORS allow-list: ${allowedOrigins.join(", ")}`)
})

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, closing`)
  server.close(() => process.exit(0))
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
