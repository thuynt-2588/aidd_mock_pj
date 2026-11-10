# Phase 01 — E2E RED setup (tester)

## Context Links
- `momorph/GzbNeVGJHz-specs.csv`, `momorph/clarifications.md`
- `spec/login-google-oauth/technical-spec.md` §5.1 (SC-001..004), §3.3 edge cases
- `research/researcher-01-next16-supabase-google-oauth.md` §6
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `tester`. Install the runner and write ONE durable screen test that fails RED on a real `/login` assertion before any implementation.

## Key Insights
- No E2E runner exists; user permitted `@playwright/test`.
- Real Google sign-in is not automatable → intercept `**/auth/v1/authorize**` and assert the outgoing request.
- Successful code exchange needs a real Google code → not in E2E; covered by manual smoke in phase 07.
- Dev host must be `http://127.0.0.1:3000` (PKCE cookies are per-host; matches `site_url`).

## Requirements
- Functional: cover SC-001..SC-004 + callback failure branch (US002) + invalid locale cookie fallback (BR-002).
- Non-functional: test file < 200 lines; stable role/text selectors only (contract below); no sleeps.

## Selector contract (binding for phases 06/07)
| Element | Locator |
|---|---|
| Logo | `getByRole('img', { name: 'Sun* Annual Awards 2025' })`, NOT inside a link |
| Title art | `getByRole('img', { name: 'ROOT FURTHER' })` |
| Intro | text "Bắt đầu hành trình của bạn cùng SAA 2025." / "Đăng nhập để khám phá!" (EN: "Start your journey with SAA 2025." / "Log in to explore!") |
| Login button | `getByRole('button', { name: 'LOGIN With Google' })` — exactly one; loading = `disabled` + `aria-busy="true"` |
| Language selector | `getByRole('button', { name: /VN|EN/ })` trigger; options `getByRole('menuitem', { name: 'VN' | 'EN' })` |
| Error | Contract: `getByRole('alert').filter({ hasText: "Đăng nhập không thành công. Vui lòng thử lại." })` / `"Sign-in failed. Please try again."`. Bare `getByRole('alert')` is NOT allowed: Next.js renders an empty `__next-route-announcer__` with `role="alert"`, so the bare form is ambiguous. |
| Footer | text "Bản quyền thuộc về Sun* © 2025" / "Copyright by Sun* © 2025" |

## Architecture
`playwright.config.ts`: `testDir: ./e2e`, chromium only, `baseURL http://127.0.0.1:3000`, `webServer { command: "npm run dev -- -H 127.0.0.1 -p 3000", url: ".../login", reuseExistingServer: true, timeout 120s }`. Env from `.env.local` automatically.

## Related Code Files
- Create: `playwright.config.ts`, `e2e/login.spec.ts`
- Modify: `package.json` (devDep `@playwright/test`, script `"e2e": "playwright test"`), `package-lock.json`, `.gitignore` (`/test-results/`, `/playwright-report/`)

## Implementation Steps
1. `npm i -D @playwright/test` then `npx playwright install chromium`.
2. Add config + script + gitignore entries.
3. Write `e2e/login.spec.ts` tests:
   - renders VN default: logo (not link), title art, intro, one button, footer, selector shows VN.
   - switch EN: open selector → EN → all texts EN, cookie `NEXT_LOCALE=en`, reload keeps EN.
   - invalid cookie `NEXT_LOCALE=fr` → VN texts.
   - error banner: `/login?error=auth_failed` shows VN alert; with cookie en shows EN alert; button still enabled.
   - click button: route-stub authorize; assert button `aria-busy=true`, request has `provider=google`, `redirect_to=http://127.0.0.1:3000/auth/callback`, `code_challenge` present.
   - callback failure: `request.get('/auth/callback', {maxRedirects:0})` and `?error=access_denied` → 3xx, `location` ends `/login?error=auth_failed`.
4. Run `npm run e2e`; confirm RED is an assertion failure on `/login` content (404 page → locator not visible), NOT install/config/dev-server error.
5. Record evidence in `evidence/red-evidence.md` (read-only input for phases 02–07): `redTestFiles: [e2e/login.spec.ts]`, `redCommand: npm run e2e`, `redExitCode`, `redFailure` (first assertion message).

## Todo List
- [ ] Install runner + chromium
- [ ] Config, script, gitignore
- [ ] login.spec.ts (6 tests)
- [ ] Valid RED captured and recorded

## Success Criteria
`npm run e2e` exits non-zero; every failure is a screen/callback assertion; evidence fields recorded and handed read-only to phases 02–07.

## Risk Assessment
- Chromium download blocked by network (Med/High) → stop, report BLOCKED; never downgrade policy.
- Dev server fails to boot → not a valid RED; fix config before recording.
- Orphan node on Windows → `reuseExistingServer: true`.

## Security Considerations
No secrets in tests; do not print `.env.local`. Tests never hit real Google.

## Next Steps
Unblocks 02, 03, 05, 06. Test file is read-only for later phases (only tester edits it).

## Rollback
`npm uninstall @playwright/test`; delete config, `e2e/`, script, gitignore lines.
