# RED evidence — Homepage (i87tDx10uM)

- redTestFiles: `e2e/homepage.spec.ts`, `e2e/support/create-test-session.ts`
- redCommand: `npx playwright test e2e/homepage.spec.ts`
- redExitCode: 1 (6/6 failed), 2026-11-10
- redFailure: assertion failures on the screen itself — `/` stays on `/` with no session (expected `/login`); signed-in tests find no header `aria-current` link, no `Award categories` heading, no account button, no `event-countdown` testid. Test sign-up against local Supabase succeeded in every `beforeEach` (failures are product assertions, not setup).
- Harness change: `playwright.config.ts` readiness probe `/` → `/login` (`/` becomes auth-guarded).

## GREEN — 2026-11-10
- `npx playwright test` (login + homepage): 11 passed, 1 skipped (countdown-future test skips while `NEXT_PUBLIC_EVENT_START_AT` is unset on the dev server). `tsc` + `eslint` exit 0.
- Countdown math verified directly (node strip-types): 2d3h4m30s → 02/03/04; +1 min → 03; past/invalid → 00, upcoming=false.
- Fixes during GREEN: proxy redirect needs absolute URL (built from Host header, stays on 127.0.0.1); `await connection()` before Supabase calls (cacheComponents Date.now rule).
- Visual: `visual/home-vi-1512-full.png` — layout ok; images pending user export to `public/home/`.

## Unit tests (Vitest 4.1.12) — 2026-11-10
- Added `vitest` (v4: v5 needs @types/node ≥22; project pins ^20), `vitest.config.ts`, script `npm test`.
- Files: `lib/countdown/compute-countdown.test.ts`, `lib/i18n/home-messages.test.ts`, `lib/supabase/proxy-session.test.ts` (Supabase client mocked at the network boundary only).
- Written after the code (retro-fit), except one behaviour driven test-first:
  - RED: "hides Coming soon once the display reaches 00:00:00" — `npx vitest run` exit 1 (1 failed / 26 passed); code kept `upcoming: true` during the final partial minute, contradicting spec B1.3.
  - GREEN: `computeCountdown` returns zeros when < 1 minute remains → 27/27 pass.
- Full run: `npm test` 27/27; `npx playwright test` 11 passed / 1 skipped (env-dependent countdown test). One E2E run right after editing package.json failed one assertion while the dev server reloaded; three reruns all green — not reproducible.

## Countdown tick bug (E2E → unit RED → GREEN) — 2026-11-10
- With `NEXT_PUBLIC_EVENT_START_AT` set, E2E "counts down" ran (no longer skipped) and failed: after 60s minutes still "04" (expected "03").
- Root cause: `msUntilNextTick` fired exactly on the minute boundary, where the floored minute is unchanged → display lagged one minute.
- RED: updated `msUntilNextTick` unit tests (12_001 / 1 ms) → 2 failed / 15 passed.
- GREEN: tick = remainder + 1 ms → `npm test` 27/27, `npx playwright test` 12/12 (0 skipped).
- `kudos-logo.png` wired at (672, 215) in the Kudos card; screenshots `visual/home-countdown.png`, `visual/home-kudos.png`.
