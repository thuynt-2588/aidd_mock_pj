---
title: "SAA 2025 Homepage (/) — auth guard, countdown, awards, Sun* Kudos, VN/EN"
status: in-progress
priority: P1
branch: feature/login
tags: [homepage, auth, proxy, supabase, i18n, countdown, momorph, e2e]
created: 2026-11-10
spec_draft: plans/261110-1011-homepage-saa/spec/homepage-saa/
---

# Plan — Homepage `/` (MoMorph i87tDx10uM)

MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM (frame `2167:9026`, 1512×4480) · testPolicy: `e2e-red-first`
Inputs: `momorph/clarifications.md`, `spec/homepage-saa/functional-spec.md`; Figma copy verbatim lives in `lib/i18n/home-messages.ts`.

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 01 | E2E RED (`e2e/homepage.spec.ts` + session helper) | done (RED 6/6 → GREEN) | `e2e/homepage.spec.ts`, `e2e/support/**`, `playwright.config.ts` |
| 02 | Auth guard (`proxy.ts` session refresh + redirect, page DAL check), `POST_LOGIN_PATH='/'` **SAFETY** | done | `proxy.ts`, `lib/supabase/proxy-session.ts`, `lib/auth/get-current-user.ts`, `lib/auth/auth-routes.ts` |
| 03 | Sign-out Server Action **SAFETY** | done | `lib/auth/sign-out-action.ts` |
| 04 | Countdown logic + home i18n | done | `lib/countdown/**`, `lib/i18n/home-messages.ts` |
| 05 | Homepage UI (Figma) | done — chờ ảnh public/home/* | `app/page.tsx`, `app/_components/home/**`, `app/globals.css`, `public/home/**` |
| 06 | GREEN + visual + review | in-progress (unit 27/27, E2E 12/12; chờ review + commit) | — |

## Key decisions
- Guard: `proxy.ts` refreshes Supabase cookies and 307s `/` → `/login` (path-only Location, no-store) when `getUser()` is empty; page re-checks via `getCurrentUser()` inside `<Suspense>` (Next docs: proxy is not the only authz).
- E2E session: per-test throwaway user via anon `signUp` on local Supabase (`enable_signup=true`, confirmations off) through an `@supabase/ssr` in-memory cookie jar → `context.addCookies`. No service_role key.
- Sign-out: Server Action `signOut({ scope: 'local' })` → `redirect('/login')`.
- Countdown: client component, minute ticks, env `NEXT_PUBLIC_EVENT_START_AT`; missing/invalid/past → 00 + hide "Coming soon".

## Safety-critical
Auth (02, 03) → full `npm run e2e` (login + homepage) every run.
