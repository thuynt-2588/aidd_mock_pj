# Phase 04 — OAuth start + /auth/callback (Track B)

## Context Links
- tech-spec §3.1 A2/A3, §3.3, §4.3 SM-001, §4.5 INT-001; research §2
- Next docs: `03-file-conventions/route.md`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `implementer`. Client-side OAuth start helper + server callback route. Safety-critical (auth/session).

## Key Insights
- PKCE verifier cookie set by browser client → start must run client-side.
- BR-003: every failure collapses to one flag `error=auth_failed`; raw provider errors never reach UI.
- Success target constant `/todo`; never read `next` from query (open redirect).

## Requirements
- `startGoogleSignIn()`: calls `signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/auth/callback' } })`; on returned error or throw → `location.assign('/login?error=auth_failed')`.
- `GET /auth/callback`: `error` param or missing `code` → redirect `/login?error=auth_failed`; `exchangeCodeForSession` error/throw → same; success → `/todo`.

## Architecture
```
click → startGoogleSignIn (browser client) → Supabase authorize → Google
      → Supabase → /auth/callback?code → server client.exchangeCodeForSession
      → Set-Cookie session + 307 /todo   |  any failure → 307 /login?error=auth_failed
```
Constants in `lib/auth/auth-routes.ts`: `AUTH_CALLBACK_PATH`, `POST_LOGIN_PATH = '/todo'`, `LOGIN_ERROR_FLAG = 'auth_failed'` (shared by route + helper + page — DRY).

## Related Code Files
- Create: `lib/auth/auth-routes.ts`, `lib/auth/start-google-sign-in.ts`, `app/auth/callback/route.ts`

## Implementation Steps
1. Read Next 16 route handler doc (`NextRequest.nextUrl`, redirect).
2. Write constants, then the helper (try/catch around the call).
3. Write route handler with try/catch around exchange; build URLs from `request.nextUrl.origin`.
4. RED→GREEN check: `npm run e2e -- -g callback` passes (callback tests from 01); full suite still red on UI parts (expected).
5. tsc + lint.

## Todo List
- [ ] constants
- [ ] start helper
- [ ] callback route
- [ ] callback E2E subset GREEN

## Success Criteria
Callback failure tests GREEN; route never redirects to a query-supplied URL; helper has no UI code.

## Risk Assessment
- Host mismatch breaks verifier (Med/High) → origin from request/location, single dev host.
- Back from Google leaves button loading → handled in 07 via `pageshow` reset.

## Security Considerations
Server-only code exchange; no tokens in URLs to UI; fixed redirect target; no error detail echoed.

## Next Steps
07 wires helper into the button. Depends on 03.

## Rollback
Delete `app/auth/` and `lib/auth/`.

## Deviation (2026-11-09, accepted)
Step 3 said build redirect URLs from `request.nextUrl.origin`. Under `next dev -H 127.0.0.1` that origin reports `localhost`, which would drop host-scoped cookies (session, PKCE, NEXT_LOCALE). Route instead returns `307` with a path-only `Location` (`/todo` or `/login?error=auth_failed`) + `Cache-Control: no-store`. Cookies written via `cookies()` still merge onto the returned `Response`. Callback E2E GREEN.
