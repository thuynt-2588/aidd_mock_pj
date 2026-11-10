# RED → GREEN evidence — Hệ thống giải

## E2E (policy: e2e-red-first)
| Step | Command | Result |
|------|---------|--------|
| RED | `npx playwright test e2e/awards-information.spec.ts` (before any page code) | 7 failed — no guard on `/awards-information` (no redirect), page 404, menu/regions not found |
| GREEN | same | 7 passed |
| Regression | `npx playwright test` | 19 passed (login 6 + homepage 6 + awards 7) |

## Unit (Vitest)
| Test | RED | GREEN |
|------|-----|-------|
| `lib/awards/active-section.test.ts` (scroll-spy, hash) | module missing → suite failed | 10 passed |
| `lib/supabase/proxy-session.test.ts` "also guards /awards-information" | 1 failed (status 200) | 6 passed |
| `lib/i18n/awards-messages.test.ts` | written with the messages | 4 passed |
| Whole suite `npm test` | — | 43 passed |

## Static checks
`tsc --noEmit` OK · `eslint app lib e2e` OK · `next build` OK (`/awards-information` partial prerender).

## Visual (1440 viewport, measured top-left px vs Figma)
| Node | Figma | Built |
|------|-------|-------|
| A title (h1) y | 502 | 502 |
| C menu x / w / h | 144 / 178 / 448 | 144 / 178 / 449 |
| D.1 x,y / h | 443,703 / 631 | 443,703 / 631 |
| D.2 y / h | 1414 / 679 | 1414 / 679 |
| D.3 y / h | 2173 / 679 | 2173 / 679 |
| D.4 y / h | 2932 / 667 | 2932 / 667 |
| D.5 y / h | 3679 / 1047 | 3679 / 1047 |
| D.6 y / h | 4806 / 730 | 4806 / 730 |

D.5 / D.6 were 44 / 72 px short until the user's Figma screenshots showed the blank lines, the Figma line separators (full-width last line) and the stacked unit text.
`lib/awards/description-lines.test.ts`: RED (module missing) → GREEN 3 passed. Whole unit suite 46 passed, full E2E 19 passed.

Screenshots: `visual/awards-1440-full.png`, `visual/awards-1440-top.png`, `visual/awards-d5-signature.png`, `visual/awards-d6-mvp.png`, `visual/awards-kudos.png`.
