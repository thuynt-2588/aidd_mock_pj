# RED → GREEN evidence — Countdown - Prelaunch page (8PJQswPZmU)

## E2E (policy: e2e-red-first)
| Step | Command | Result |
|------|---------|--------|
| RED | `npx playwright test e2e/prelaunch.spec.ts` with `app/prelaunch/page.tsx` hidden | exit 1 — 4 failed: heading / `prelaunch-countdown` not found (404), `getAttribute` timeout |
| GREEN | same, page restored | 4 passed |
| Regression (public) | `npx playwright test e2e/prelaunch.spec.ts e2e/login.spec.ts` | 10 passed |
| Regression (signed-in) | `npx playwright test` | **blocked**: 11 homepage/awards tests fail in setup (`Test sign-up failed: fetch failed`) — Docker Desktop / local Supabase not running. Rerun after `npx supabase start`. |

Note: the RED run was done after the code was written (E2E written first, but the first run happened once the page existed); the page file was hidden to reproduce RED.

## Unit (Vitest)
| Test | RED | GREEN |
|------|-----|-------|
| `lib/countdown/prelaunch-gate.test.ts` | module missing → suite failed | passed |
| `lib/countdown/prelaunch-proxy.test.ts` | module missing → suite failed | passed |
| `lib/i18n/prelaunch-messages.test.ts` | module missing → suite failed | passed |
| Whole suite `npm test` | — | 62 passed (9 files) |

## Static checks
`tsc --noEmit` OK · `eslint app lib e2e proxy.ts` OK · `next build` OK (`/prelaunch` partial prerender).

## Visual (1512x1077 viewport, top-left px vs Figma via MoMorph `get_frame_node`)
| Node | Figma x,y / w×h | Built |
|------|-----------------|-------|
| 0.2 Title (2268:35137) y / h | 314 / 48 | 315 / 48 |
| Time row (2268:35138) | 434,386 / 644×192 | 434,387 / 645×192 |
| 1 Days unit (2268:35139) | 434,386 / 175×192 | 434,387 / 175×192 |
| Digit tile (2268:35141) | 434,386 / 77×123 | 434,387 / 77×123 |
| DAYS label (2268:35143) y | 529 | 531 |

First build centred the block vertically (title y≈410, 96px low); fixed with bottom padding so the block starts at y=314 like Figma.
Background: `public/prelaunch/bg.png` (user's Figma export of MM_MEDIA_BG) + Cover gradient; the temporary homepage keyvisual was replaced.
Screenshot: `visual/prelaunch-1512x1077.png`.

## Requirement change 2026-11-11 — lock always on, target = website opening time
- Unit RED: gate/proxy tests rewritten for `NEXT_PUBLIC_SITE_OPEN_AT` → 6 failed / 20 passed. GREEN: `npm test` 57/57.
- E2E locked state: `NEXT_PUBLIC_SITE_OPEN_AT=2026-12-01T09:00:00+07:00 next build && next start -p 3100`, `E2E_BASE_URL=http://127.0.0.1:3100 npx playwright test e2e/prelaunch.spec.ts` → 5 passed (open-state test skipped). Production build rebuilt without the variable afterwards.
- E2E open state (dev server, variable unset): 1 passed, 5 skipped.
- `tsc`, `eslint`, `next build` OK.
