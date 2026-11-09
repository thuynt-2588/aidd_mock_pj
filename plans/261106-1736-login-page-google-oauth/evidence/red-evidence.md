# RED evidence — Login (GzbNeVGJHz), phase 01

Read-only input for phases 02–07. Only `tester` edits the test files.

```
redTestFiles: [e2e/login.spec.ts]
redCommand:   npm run e2e        (runs: playwright test)
redExitCode:  1
testPolicy:   e2e-red-first (web, chromium only)
```

## redFailure (first assertion message)

`Error: expect(locator).toBeVisible() failed` — `getByRole('img', { name: 'Sun* Annual Awards 2025' })` — `element(s) not found` (SC-001 logo; `/login` has no screen yet).

## Per-test summary (6 run, 0 passed, 6 failed)

| # | Test | Requirement | First failing assertion | Cause |
|---|---|---|---|---|
| 1 | renders the login screen in Vietnamese by default | SC-001 | `toBeVisible` logo `Sun* Annual Awards 2025` not found | `/login` screen missing |
| 2 | switches to English, persists cookie, survives reload | SC-004 | `toBeVisible` `getByRole('button', { name: /VN\|EN/ })` not found | language selector missing |
| 3 | falls back to Vietnamese for unsupported cookie `fr` | BR-002 | `toBeVisible` `Bắt đầu hành trình của bạn cùng SAA 2025.` not found | screen copy missing |
| 4 | error banner in active locale, button enabled | SC-003 | `toContainText` on `getByRole('alert')`: received `""` | matched only Next's `__next-route-announcer__`; no error banner |
| 5 | login click starts Google PKCE authorize request | SC-002 | `toBeEnabled` `getByRole('button', { name: 'LOGIN With Google' })` not found | login button missing |
| 6 | callback without code / with `error=access_denied` → `/login?error=auth_failed` | US002, BR-003 | `expect(REDIRECT_STATUSES).toContain(status)`: expected `404`, received 3xx set | `/auth/callback` route missing |

Every failure is an assertion on the requested screen or callback behavior. No install, config, browser-launch, or dev-server error occurred in the run that counts (see Notes).

## Notes for downstream phases

- **Selector `getByRole('alert')` is ambiguous.** Next.js renders an empty `role="alert"` `__next-route-announcer__` on every page. Once the phase-06 banner renders, this locator resolves to two elements and Playwright will raise a strict-mode violation. Either the banner must be the only alert, or the test must narrow it with `.filter({ hasText })`. Decision pending with the orchestrator; the contract text was kept verbatim.
- **Readiness probe deviation.** Phase file set `webServer.url` to `/login`. That probe can never pass before the screen exists, so the run timed out with no assertions executed. `playwright.config.ts` probes `/` (200 today) instead. Test assertions are unchanged.
- **Dev server left running.** During diagnosis a `next dev -H 127.0.0.1 -p 3000` was started in the background. Stopping it was denied by the permission gate, so it is still listening on port 3000. `reuseExistingServer: true` reuses it, which is the same project and command. Stop it manually before a clean-environment run.
- **Next workspace-root warning.** `Next.js ignored package-lock.json in C:\Users\nguyen.thi.thuyd` because a lockfile exists in the home directory. Non-fatal. Fix, if wanted, is `turbopack.root` in `next.config.ts`, which this phase does not own.
- Strict-mode and timeouts: the SC-002 and SC-004 interactions now assert visibility/enabled before acting, so the failure message names the missing element rather than a 30 s action timeout.

## Files changed in this phase

- `package.json`: devDependency `@playwright/test@^1.65.0`; script `"e2e": "playwright test"`
- `package-lock.json`: updated by `npm i -D`
- `playwright.config.ts`: new (chromium only, `baseURL http://127.0.0.1:3000`, `webServer` with `reuseExistingServer: true`, 120 s timeout)
- `e2e/login.spec.ts`: new, 6 tests, 143 lines, no sleeps
- `.gitignore`: `/test-results/`, `/playwright-report/` added
- Chromium 1254 downloaded to the user Playwright cache (not in the repo)

## Revision (orchestrator decisions applied)

- Error-banner selector narrowed to `getByRole('alert').filter({ hasText })` with the exact VN/EN contract texts. Bare `getByRole('alert')` removed from all assertions. Phase-01 selector contract updated to match.
- Readiness probe `/` accepted by orchestrator.
- Re-run `npm run e2e`: exit 1, 6/6 failed, all screen or callback assertions. Error-banner test redFailure is now `expect(locator).toBeVisible() failed` on `getByRole('alert').filter({ hasText: 'Đăng nhập không thành công. Vui lòng thử lại.' })`, element(s) not found. The other five are unchanged.
- File is 147 lines.

## Harness revision (phase 07, SC-002)

- **Symptom.** `npm run e2e` ran 5 passed, 1 failed. SC-002 failed at `toHaveAttribute('aria-busy','true')` after the 30 s timeout, with an empty received value. The authorize request itself was captured and its provider, `redirect_to`, and `code_challenge` assertions passed.
- **Root cause (harness, not product).** The hold `page.route('**/auth/v1/authorize**', () => {})` never settles the top-level navigation that `window.location.assign` starts. Chromium keeps that navigation pending, so `page.evaluate` on the frame never returns and Playwright cannot read the button DOM. A diagnostic probe (throwaway, not committed) timed out on every DOM sample taken after the click under this hold, and `locator.getAttribute('aria-busy')` also timed out.
- **Product is correct.** The same click with `route.fulfill({ status: 204, body: "" })` (204 cancels the top-level navigation and keeps the current document) gave `aria-busy="true"` and `disabled=true` at 50 ms, with the URL still `/login`. Source: `app/login/_components/google-login-button.tsx:27-28` (sets `loading` before `startGoogleSignIn()`) and `:36` (`aria-busy={loading}`). Hypothesis (b), "product never renders aria-busy=true", was falsified.
- **Rejected alternative.** `route.abort()` moves the page away from `/login` (to `/`) within about 300 ms. It exercises a failure path, not the loading state, so it does not satisfy the assertion.
- **Change.** The route handler only, now `route.fulfill({ status: 204, body: "" })`. No assertion, selector, expected value, or test name changed. The comment above the handler records why a never-settling route cannot be used.
- **Result.** `npm run e2e` exit 0, 6 passed, 4 consecutive runs (see `raw-temper-runs.json`).
