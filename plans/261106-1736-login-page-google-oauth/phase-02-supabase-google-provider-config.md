# Phase 02 — Supabase Google provider config (Track B)

## Context Links
- `momorph/clarifications.md` (Google client id/secret via env), research §3, tech-spec §4.6
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `implementer`. Enable Google in local Supabase Auth and fix the redirect allow-list. Safety-critical (auth config).

## Key Insights
- `additional_redirect_urls` is currently `["https://127.0.0.1:3000"]` (wrong scheme, no callback path) → Supabase would fall back to `site_url`.
- No `[auth.external.google]` block yet; only Apple template at line ~326.
- `supabase/.env` is covered by root `.gitignore` pattern `.env*` — verify with `git check-ignore supabase/.env`.

## Requirements
- FR-001: Google enabled for all accounts; id/secret only via `env(...)`.
- Allow-list includes `http://127.0.0.1:3000/auth/callback`.

## Architecture
Browser → Supabase `:54321/auth/v1/authorize` → Google → `:54321/auth/v1/callback` → `redirect_to` (`/auth/callback`, must be allow-listed).

## Related Code Files
- Modify: `supabase/config.toml`
- User-managed (never committed): `supabase/.env` with `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

## Implementation Steps
1. Set `additional_redirect_urls = ["http://127.0.0.1:3000/auth/callback"]` (`site_url` unchanged).
2. Add block:
   ```toml
   [auth.external.google]
   enabled = true
   client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
   secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
   redirect_uri = ""
   url = ""
   skip_nonce_check = true
   ```
3. `git check-ignore supabase/.env` must print the path.
4. `npx supabase stop && npx supabase start` (user has filled `supabase/.env`); confirm Auth starts without config error.
5. Note for user: Google Console authorized redirect URI = `http://127.0.0.1:54321/auth/v1/callback`.

## Todo List
- [ ] Redirect URL fixed
- [ ] Google block added
- [ ] `supabase/.env` confirmed ignored
- [ ] Supabase restarts cleanly

## Success Criteria
`supabase start` healthy; `GET http://127.0.0.1:54321/auth/v1/settings` reports `external.google: true`.

## Risk Assessment
- Missing env values → Supabase start fails (Med/Med) → user fills `supabase/.env`; report NEEDS_CONTEXT, do not inline values.
- localhost vs 127.0.0.1 mix → PKCE "code verifier not found" → single host everywhere.

## Security Considerations
Never commit or echo secrets. Only `env()` references in config.toml.

## Next Steps
Needed by 07 (manual real-login smoke). E2E tests stub authorize, so 01's suite does not depend on this phase.

## Rollback
Revert `supabase/config.toml`; restart Supabase.
