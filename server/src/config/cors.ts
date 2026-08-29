import cors, { type CorsOptions } from "cors"

import { env, isDevelopment } from "./env"

/**
 * Credentialed CORS configuration (BE-002, SYS-003, ADR-008).
 *
 * The frontend and backend are different sites in production (Vercel ↔ Render),
 * so the auth cookie is `SameSite=None; Secure` and every browser request is
 * credentialed. That makes CORS a real security boundary:
 *
 *   - `credentials: true` is required for the cookie to be sent at all.
 *   - A wildcard origin is invalid with credentials, so the allow-list is
 *     explicit (docs/20 §10).
 *   - `X-Requested-With` is permitted because state-changing requests carry it
 *     as a CSRF mitigation (ADR-021).
 */

function buildAllowList(): string[] {
  const origins = new Set<string>([env.FRONTEND_URL])

  // Convenience for local work when FRONTEND_URL points elsewhere.
  if (isDevelopment) {
    origins.add("http://localhost:3000")
  }

  return [...origins]
}

export const allowedOrigins = buildAllowList()

export const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    // Same-origin and non-browser clients (curl, Supertest) send no Origin.
    if (!requestOrigin) {
      callback(null, true)
      return
    }

    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true)
      return
    }

    // Reject by not reflecting the origin. Returning `false` rather than an
    // error keeps the response a clean CORS failure instead of a 500.
    callback(null, false)
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Requested-With", "Authorization"],
  maxAge: 86_400,
}

export const corsMiddleware = cors(corsOptions)
