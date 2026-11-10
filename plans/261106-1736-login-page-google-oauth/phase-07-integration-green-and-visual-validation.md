# Phase 07 — Integration, GREEN rerun, visual validation

## Context Links
- Phases 04, 05, 06 contracts; phase 01 RED evidence + selector contract
- tech-spec §3.1 A1/A2, §3.3, §4.3 SM-001; Next docs `08-caching.md` (Suspense with cacheComponents)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `implementer` (wiring) then `tester` (GREEN + visual). Safety-critical → full suite.

## Key Insights
- `cacheComponents: true`: `getLocale()` and `searchParams` must be read inside a `<Suspense>` child, else blocking-route error.
- Root layout stays static; selector syncs `document.documentElement.lang` on the client.
- Back from Google may restore page from bfcache with button stuck loading → reset on `pageshow` (`persisted`).

## Requirements
- `/login` texts from `getMessages(getLocale())`; any non-empty `error` query → `LoginErrorAlert(loginError)`.
- Selector `onSelect` → `setLocaleAction` (passed as Server Action prop).
- Button `handleClick` → `startGoogleSignIn()`; double-click ignored while loading.

## Architecture
`page.tsx` (static shell) → `<Suspense fallback={null}>` → async `LoginScreen` (reads locale + searchParams, passes strings) → Track A components.

## Related Code Files
- Modify: `app/login/page.tsx`, `app/login/_components/language-selector.tsx`, `app/login/_components/google-login-button.tsx`
- Create (if page would exceed 200 lines): `app/login/_components/login-screen.tsx`

## Implementation Steps
1. Implementer: wire page/Suspense, selector action, button helper + `pageshow` reset; tsc, lint, `npm run build`.
2. Tester: rerun exact `redCommand` (`npm run e2e`) → must exit 0 with all tests from 01 unchanged.
3. Tester: visual validation vs Figma frame `662:14387` at 1440px via Playwright MCP (VN + EN + error state + hover/focus).
4. Manual smoke (user, needs `supabase/.env` + `supabase start`): real Google login → lands on `/todo` (404 accepted, RISK-01) with `sb-*` session cookie; cancel → `/login` error.
5. Reviewer pass.

## Todo List
- [ ] Wiring + build
- [ ] E2E GREEN (same command)
- [ ] Visual validation
- [ ] Manual real-login smoke
- [ ] Review

## Success Criteria
`npm run e2e` exit 0; no material visual mismatch; manual smoke reaches `/todo` with session cookie; no test edited to pass.

## Risk Assessment
- Visual mismatch → bounded fix back to `momorph-ui-implementer`, never weaken tests.
- Suspense fallback flash (Low) → `fallback={null}`, acceptable.

## Security Considerations
Verify no secret key in client bundle (`grep` `.next/static` for `service_role`/secret); session cookie set only by callback.

## Next Steps
Changelog/roadmap update by delivery-tracker (no `docs/` folder exists yet — flag). `proxy.ts` session refresh deferred to the `/todo` screen.

## Rollback
Revert the three wiring edits; UI and Track B modules remain independent.
