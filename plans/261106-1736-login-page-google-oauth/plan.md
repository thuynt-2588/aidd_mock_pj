---
title: "SAA 2025 /login — Google OAuth (Supabase local) + VN/EN switch"
description: "Login screen GzbNeVGJHz: Google sign-in via Supabase Auth PKCE, redirect /todo, NEXT_LOCALE vi/en dictionary"
status: in-progress
priority: P1
effort: 11.5h
branch: main
tags: [login, auth, supabase, oauth, i18n, momorph, e2e]
created: 2026-11-08
spec_draft: plans/261106-1736-login-page-google-oauth/spec/login-google-oauth/
---

# Plan — /login (MoMorph GzbNeVGJHz)

MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: `e2e-red-first`
Inputs: `momorph/clarifications.md` (authoritative), `momorph/GzbNeVGJHz-specs.csv`, `spec/login-google-oauth/*`, `research/researcher-01-next16-supabase-google-oauth.md`.

## Phases

| # | Phase | Track / Owner | Status | Effort | Depends on |
|---|-------|---------------|--------|--------|------------|
| 01 | [E2E RED setup](phase-01-e2e-red-setup.md) | tester | done | 2h | — |
| 02 | [Supabase Google provider config](phase-02-supabase-google-provider-config.md) | B / implementer | done (chờ user: supabase/.env + restart) | 0.5h | 01 |
| 03 | [Supabase SSR clients](phase-03-supabase-ssr-clients.md) | B / implementer | done | 0.5h | 01 |
| 04 | [OAuth start + /auth/callback](phase-04-oauth-start-and-callback-route.md) | B / implementer | done | 1.5h | 03 |
| 05 | [i18n dictionary + locale cookie](phase-05-i18n-dictionary-and-locale-cookie.md) | B / implementer | done | 1h | 01 |
| 06 | [Login screen UI (Track A)](phase-06-login-screen-ui-track-a.md) | A / momorph-ui-implementer | in-progress (code trước, ảnh user export sau) | 4h | 01, user assets |
| 07 | [Integration + GREEN + visual](phase-07-integration-green-and-visual-validation.md) | implementer → tester | pending | 2h | 02, 04, 05, 06 |

## Dependency graph

```
01 RED ─┬─ 02 config ───────────────┐
        ├─ 03 clients ── 04 auth ───┤
        ├─ 05 i18n ─────────────────┼── 07 integration (GREEN + visual)
        └─ 06 UI (needs public/login/* assets) ┘
```
02, 03→04, 05, 06 run in parallel after 01 (disjoint files). No Track A/B merge barrier beyond 07.

## File ownership (disjoint)

| Phase | Owns |
|-------|------|
| 01 | `package.json`, `package-lock.json`, `playwright.config.ts`, `e2e/**`, `.gitignore` |
| 02 | `supabase/config.toml` (user owns gitignored `supabase/.env`) |
| 03 | `lib/supabase/**` |
| 04 | `app/auth/callback/route.ts`, `lib/auth/**` |
| 05 | `lib/i18n/**` |
| 06 | `app/login/**`, `app/layout.tsx`, `app/globals.css`, `public/login/**` |
| 07 | edits `app/login/page.tsx` + two client components from 06 (sequential, after 06) |

## Key decisions (from spec/research — do not reopen)
- OAuth start in a client component via browser client (PKCE verifier cookie); callback route exchanges code server-side, redirects fixed `/todo` (no `next` param), any failure → `/login?error=auth_failed`.
- No `proxy.ts` — no protected route in scope (tech-spec 5.2 A0). No guard on `/login`, no `/todo` page.
- Locale: cookie `NEXT_LOCALE` ∈ {vi,en}, default/fallback `vi`, set via Server Action; plain TS dictionary.
- `cacheComponents: true` → cookie/searchParams reads live inside `<Suspense>`; root layout stays static (`lang="vi"`), client sets `document.documentElement.lang`.
- Env key name: existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not publishable). Dev host: `127.0.0.1:3000` only.

## Safety-critical
Auth (02, 03, 04) + config/CI (01, 02) → full E2E suite every run, no scoping down.

## Risks (top)
- Assets not yet in `public/login/` → Track A blocked (High/High) — UI built against placeholders forbidden; 06 starts only when assets land.
- `/todo` 404 after real login (RISK-01, accepted).
- Real Google login not automatable → manual smoke in 07.

## Unresolved
- Exact asset filenames depend on what the user supplies (06 adopts them; E2E asserts alt text, not filenames).
