import app from "../dist/app.js"

/**
 * Vercel serverless entry point (docs/24).
 *
 * Imports the *compiled* app rather than the TypeScript source: `@vercel/node`
 * would otherwise bundle this file with esbuild, which has to re-resolve the
 * project's NodeNext `.js`-suffixed specifiers on the fly. Going through the
 * existing `npm run build` output sidesteps that risk entirely — `dist/app.js`
 * is exactly what `npm start` already runs locally and on Railway.
 *
 * `src/app.ts` exports the composed Express app without binding a port
 * (originally so Supertest could import it directly); Vercel's Node runtime
 * accepts that same Express app as a request handler.
 */
export default app
