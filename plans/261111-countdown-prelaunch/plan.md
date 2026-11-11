---
title: "Countdown - Prelaunch page"
momorph_screen: 8PJQswPZmU
figma: 9ypp4enmFmdK3YAFJLIu6C / 2268:35127 (1512 x 1077)
route: /prelaunch
test_policy: e2e-red-first
status: done
---

# Countdown - Prelaunch page — implementation plan

## Scope
| Spec item | Implementation |
|-----------|----------------|
| 0.1 Background image + Cover | `app/prelaunch/page.tsx` (image `cover`, 18deg gradient from Figma) |
| 0.2 Title | `app/prelaunch/page.tsx` h1, copy in `lib/i18n/prelaunch-messages.ts` |
| 1–3 DAYS / HOURS / MINUTES | `app/prelaunch/_components/prelaunch-countdown.tsx` — ticks every second, reuses `computeCountdown` + DSEG7 digit font |
| 1 Navigation lock / unlock | `lib/countdown/prelaunch-gate.ts` + `lib/countdown/prelaunch-proxy.ts`, called first in `proxy.ts`; opening time = `NEXT_PUBLIC_SITE_OPEN_AT`, lock always on; client redirects to `/` at zero |

## Phases
1. RED: `e2e/prelaunch.spec.ts` (5 locked-state + 1 open-state tests), unit tests for gate, proxy step, messages — done
2. GREEN: gate + proxy + page + countdown — done (vitest 57/57; prelaunch E2E locked 5/5 on `next start` :3100, open 1/1 on dev)
3. Visual check at 1512x1077 — `evidence/visual/prelaunch-1512x1077.png`

## Source data
`momorph/8PJQswPZmU-specs.csv`, `momorph/frame-overview.txt`, `momorph/frame-styles.txt` (MoMorph MCP; data flagged "imported from V1, not re-synced with Figma").
