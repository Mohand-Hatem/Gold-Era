import cookieParser from "cookie-parser"
import express, { type Express, type Request, type Response } from "express"

import { API_PREFIX, JSON_BODY_LIMIT } from "./config/constants.js"
import { corsMiddleware } from "./config/cors.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { notFound } from "./middleware/notFound.js"
import { requestLogger } from "./middleware/requestLogger.js"
import { authRoutes } from "./modules/auth/auth.routes.js"
import { fileRoutes } from "./modules/files/files.routes.js"
import { statsRoutes } from "./modules/stats/stats.routes.js"
import { userRoutes } from "./modules/users/users.routes.js"

/**
 * Composes the Express application.
 *
 * Kept separate from `server.ts` so tests (Phase 12, Vitest + Supertest) can
 * import the composed app without binding a port — docs/15, docs/23.
 *
 * Middleware order matters:
 *   CORS → body parsing → logging → routes → notFound → errorHandler
 */
export function createApp(): Express {
  const app = express()

  // Trust the platform proxy (Railway) so `Secure` cookies and
  // client IPs resolve correctly behind TLS termination.
  app.set("trust proxy", 1)
  app.disable("x-powered-by")

  // ── Global middleware ─────────────────────────────────────────────────────
  app.use(corsMiddleware)
  app.use(express.json({ limit: JSON_BODY_LIMIT }))
  app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }))
  // Parses the httpOnly auth cookie into req.cookies (ADR-008).
  app.use(cookieParser())
  app.use(requestLogger)

  // ── Health check (ADR-026) ────────────────────────────────────────────────
  // Infrastructure endpoint: mounted at the root, not under /api, and
  // deliberately not wrapped in the response envelope (docs/11 §2).
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      uptime: Number(process.uptime().toFixed(3)),
      timestamp: new Date().toISOString(),
    })
  })

  // ── API routers ───────────────────────────────────────────────────────────
  app.use(`${API_PREFIX}/auth`, authRoutes)
  app.use(`${API_PREFIX}/files`, fileRoutes)
  app.use(`${API_PREFIX}/users`, userRoutes)
  app.use(`${API_PREFIX}/stats`, statsRoutes)

  // ── Terminal middleware ───────────────────────────────────────────────────
  app.use(notFound)
  app.use(errorHandler)

  return app
}

export const app = createApp()
export default app
