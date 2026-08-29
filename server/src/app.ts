import express, { type Express } from "express"

/**
 * Composes the Express application.
 *
 * Kept separate from `server.ts` so tests (Phase 12, Vitest + Supertest) can
 * import the composed app without binding a port. See docs/15 and docs/23.
 *
 * Global middleware, routers, and error handling are added in Phase 2
 * (docs/27 Phase 2 — BE-001..006). This file is intentionally minimal.
 */
export function createApp(): Express {
  const app = express()

  return app
}

export default createApp
