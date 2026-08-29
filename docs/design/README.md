# Stitch Design Assets — DocuFlow Management System

Downloaded UI designs for the **Managing Your Files** assessment. These are **reference material only** — they are not part of the application build and must not be copied into `client/` verbatim (see "How to use" below).

## Source

| Field | Value |
|---|---|
| Stitch project | DocuFlow Management System |
| Project ID | `15464828130012178836` |
| Design system | Structure & Flow (`assets/463eff7774a34a85bd4e51a716d40677`) |
| Device type | DESKTOP (2560 × 2048) |
| Retrieved | 2026-08-29 via Stitch MCP (`get_project`, `list_screens`, `list_design_systems`) |

## Contents

```
docs/design/
├── README.md                 ← this file
├── manifest.json             ← screen id → title → slug → files → dimensions
├── project.json              ← raw get_project response (theme, namedColors, screen instances)
├── design-system.json        ← raw design system asset (theme + style guidelines)
├── DESIGN.md                 ← design tokens: colors, typography, spacing, roundness
├── STYLE-GUIDELINES.md       ← brand, layout, elevation, component rules
├── screenshots/              ← 12 PNG renders (all verified PNG signature)
└── html/                     ← 11 HTML exports (all verified <!DOCTYPE html>)
```

## Screens

| # | Screen | Screen ID | PNG | HTML |
|---|---|---|---|---|
| 1 | Login | `426a18262db2446e929ca736c0242aba` | ✅ | ✅ |
| 2 | Register | `6a1596c23497463ab21328bd6976e402` | ✅ | ✅ |
| 3 | OTP Verification | `ca86be78d8604c039b645d0161fe466d` | ✅ | ✅ |
| 4 | Upload Experience | `4d6c5b66b5f84c28b07538f9e627c793` | ✅ | ✅ |
| 5 | My Files | `6cceeea06c5d4a66a4b40e82e21cc26a` | ✅ | ✅ |
| 6 | File Details | `a392a184a42944fab3b38ed54754611f` | ✅ | ✅ |
| 7 | Dashboard | `dbfceb1dcc8e43b5869e629a37ed5578` | ✅ | ✅ |
| 8 | Landing Page (Premium) | `2b1b7d1e21db445eb97b94af896d77d9` | ✅ | ✅ |
| 9 | My Files (Premium) | `362b856ed4fc407aa2f19dfcb66397d7` | ✅ | ✅ |
| 10 | Dashboard (Premium) | `bc89c2ede76a434b90ba691a51bcea44` | ✅ | ✅ |
| 11 | Authentication (Premium) | `f481f5071a804e6e8dbefa5d4ed7bce9` | ✅ | ✅ |
| 12 | Home Page (uploaded image) | `6603821664530220347` | ✅ | — (image asset, no HTML) |
| — | Design System | `assets/463eff7774a34a85bd4e51a716d40677` | — | `DESIGN.md` + `STYLE-GUIDELINES.md` |

Screen 12 is an uploaded PNG (`ChatGPT Image Aug 29, 2026…`), not a generated screen, so it has no `htmlCode` entry. The "Design System" listed as screen 1 in the request is an asset stub, retrieved via `list_design_systems` instead.

## Design tokens (summary — full detail in `DESIGN.md`)

**Fonts:** Hanken Grotesk (headline) · Inter (body) · JetBrains Mono (labels)
**Roundness:** ROUND_FOUR · **Color mode:** LIGHT · **Seed:** `#0f172a`

Key colors:

| Token | Hex |
|---|---|
| surface / background | `#f8f9ff` |
| surface-container-lowest | `#ffffff` |
| surface-container | `#e5eeff` |
| on-surface | `#0b1c30` |
| primary | `#000000` |
| primary-container | `#131b2e` |
| secondary | `#0051d5` |
| error | `#ba1a1a` |
| outline | `#76777d` |

Typography scale: `display` 48/700 · `h1` 32/600 · `h2` 24/600 · `h3` 18/600 · `body-lg` 16 · `body-md` 14 · `body-sm` 12 · `label-caps` 11/600 · `mono-label` 12.

Layout rules from `STYLE-GUIDELINES.md`: strict 8pt grid, 12-column fluid desktop grid with 24px gutters, 280px sidebar (collapsible to 64px), single-column below 768px, tonal-layer elevation rather than heavy shadows.

## How to use during implementation

These assets inform Phases 7–10 (`docs/27-Development-Phases.md`). Constraints from `docs/PROJECT-RULES.md`:

1. **Reference, not source.** The exports are static Tailwind-CDN HTML. The build uses Next.js App Router + Tailwind (compiled) + React components. Translate layout and tokens; do not paste HTML.
2. **No new dependencies.** The exports load `cdn.tailwindcss.com` and Material Symbols from a CDN. Neither enters the app — Tailwind is already a project dependency, and icons should use an already-approved approach. Adding an icon library requires §7 approval.
3. **Design tokens go in `app/globals.css` under `@theme`.** The project uses **Tailwind 4** (`tailwindcss@4.3.3`), which is CSS-first — there is no `tailwind.config.ts`. Declare the colors/fonts/spacing above as `@theme` custom properties (e.g. `--color-surface: #f8f9ff; --font-headline: "Hanken Grotesk";`) so components use semantic utility classes rather than hex literals.
4. **Scope discipline.** The "Premium" variants and the Landing Page are visual explorations. Only screens matching P0 requirements get built: login, register, OTP, upload, my files, file details, user dashboard, admin dashboard, admin users, admin files. Anything else is P2/P3.
5. **Screens present here but not in the plan** (e.g. Landing Page) do not expand scope. `docs/02-SRS.md` remains authoritative for what gets built.
6. **Screens in the plan but missing here** — Profile, Admin Users, Admin Files — have no Stitch design. Build them consistent with the design system.

## Reproducing the download

Stitch MCP is configured in `opencode.json` as a remote server. Direct JSON-RPC also works:

```bash
curl -sS -L -X POST "https://stitch.googleapis.com/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_screens","arguments":{"projectId":"15464828130012178836"}}}'
```

Each screen returns `screenshot.downloadUrl` and `htmlCode.downloadUrl`, fetched with `curl -L`. Download URLs are signed and expire — re-run `list_screens` to refresh them rather than reusing stored URLs.
