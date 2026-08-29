import { createApp } from "./app"

/**
 * Process entry point: binds the composed app to a port.
 *
 * Typed, validated environment loading arrives in Phase 2 (BE-001,
 * `config/env.ts`). For now PORT is read directly with a documented default
 * matching docs/25-Environment-Variables.md.
 */
const PORT = Number(process.env.PORT ?? 8080)

const app = createApp()

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
