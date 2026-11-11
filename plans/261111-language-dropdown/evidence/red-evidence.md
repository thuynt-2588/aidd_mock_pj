# RED → GREEN evidence — Dropdown-ngôn ngữ (hUyaaugye2)

The dev server is locked by `NEXT_PUBLIC_SITE_OPEN_AT` (prelaunch), so E2E ran against
`NEXT_PUBLIC_SITE_OPEN_AT= next build && next start -p 3100` with `E2E_BASE_URL=http://127.0.0.1:3100`.

## E2E
| Step | Command | Result |
|------|---------|--------|
| RED | `npx playwright test e2e/language-dropdown.spec.ts` (old component) | 4 failed — no `menuitemradio` / `aria-checked`, panel border `rgb(46,57,64)` instead of `rgb(153,140,95)`; 1 passed (Escape / outside click already worked) |
| GREEN #1 | same | selected row colour came out as `oklab(... / 0.2)` (Tailwind `/20` modifier) → exact token `--saa-accent-selected` |
| GREEN | `... e2e/language-dropdown.spec.ts e2e/login.spec.ts` | dropdown 5/5; login 5/6 — SC-002 fails only because it hard-codes the `:3000` callback origin and this run used `:3100` (not a regression) |
| Regression (signed-in) | — | not run: Docker / local Supabase down, and the dev server is in prelaunch lock |

## Static checks
`npm test` 57/57 · `tsc --noEmit` OK · `eslint` OK · `next build` OK.

## Visual
List panel measured 124x126 at (1172, 72) on /login 1440 — Figma: 110 + 2x6 + 2x1 = 124 wide, 2x56 + 12 + 2 = 126 tall.
Screenshots: `visual/dropdown-vn-open.png`, `visual/dropdown-en-open.png`.
