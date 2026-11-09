# Phase 03 — Supabase SSR clients (Track B)

## Context Links
- research §1, tech-spec §4.1; `node_modules/@supabase/ssr/README.md`; Next docs `04-functions/cookies.md`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `implementer`. Two tiny factories over `@supabase/ssr`. Safety-critical (sessions).

## Key Insights
- Env names in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — reuse, do not rename.
- `cookies()` is async in Next 16; `setAll` may throw inside Server Component render → swallow there.
- `proxy.ts` NOT added (no protected route; YAGNI, tech-spec 5.2 A0).

## Requirements
- Browser client for OAuth start (stores PKCE verifier cookie).
- Server client (cookie get/set) for the callback route.
- FR-601: no secret/service key ever referenced.

## Architecture
`lib/supabase/browser-client.ts` → `createBrowserClient(url, anonKey)`.
`lib/supabase/server-client.ts` → `async createServerClient` with `getAll`/`setAll` over `await cookies()`.
Shared env read in one helper (`lib/supabase/supabase-env.ts`) that throws a clear error if missing (DRY).

## Related Code Files
- Create: `lib/supabase/supabase-env.ts`, `lib/supabase/browser-client.ts`, `lib/supabase/server-client.ts`

## Implementation Steps
1. Read `@supabase/ssr` README + `.d.ts` for 0.12.7 `setAll` signature.
2. Write env helper, then both factories per research §1 using the anon key name.
3. `npx tsc --noEmit` and `npm run lint` clean.

## Todo List
- [ ] env helper
- [ ] browser client
- [ ] server client
- [ ] typecheck + lint

## Success Criteria
Compiles; consumed by phase 04 without changes; no `service_role`/secret key strings in `lib/`.

## Risk Assessment
- Wrong env name → runtime undefined (Low/High) → helper throws explicit message.

## Security Considerations
Only public URL + anon key; session cookies managed by `@supabase/ssr` (httpOnly flags as library sets).

## Next Steps
Unblocks 04. RED for this phase = 01 suite (callback/click tests still red until 04/07).

## Rollback
Delete `lib/supabase/`.
