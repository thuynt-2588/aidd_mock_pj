# Phase 06 — Login screen UI (Track A)

test_policy: e2e-red-first
Owner: `momorph-ui-implementer` (mode: screen) · Status: pending · Blocked until assets exist in `public/login/`
Screen: Login — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz (frame `662:14387`)
Inputs: `momorph/GzbNeVGJHz-specs.csv`, `momorph/clarifications.md`, RED evidence from phase 01 (read-only), selector contract in `phase-01-e2e-red-setup.md`.

**Goal:** Pixel-faithful desktop (1440px) presentational /login: header (static logo + VN/EN selector), hero key visual, ROOT FURTHER art, intro, Google button (hover/focus/loading visuals), error alert slot, footer.

**Owned files:** `app/login/page.tsx` (static composition, VN text from Figma), `app/login/_components/*` (kebab-case, each <200 lines), `app/layout.tsx` (fonts, metadata, `lang="vi"`), `app/globals.css` (tokens), `public/login/*` (user-supplied, adopt as given).

**Out of scope:** Supabase calls, cookie/locale logic, Server Actions, `/auth/*`, responsive/mobile, `/todo`, logo link, any invented/placeholder art, editing `e2e/**`.

**Integration contract (consumed by 07):**
- `LoginHeader({ languageSelector })`, `LoginHero`, `LoginIntro({ line1, line2 })`, `LoginFooter({ text })`, `LoginErrorAlert({ message })` (`role="alert"`, renders nothing when no message) — all strings via props.
- `LanguageSelector` ("use client"): props `{ current: 'vi'|'en', onSelect: (l) => void | Promise<void> }`; trigger button shows flag + VN/EN; menu items `role="menuitem"`.
- `GoogleLoginButton` ("use client"): props `{ label }`; owns `idle|loading` state; loading = `disabled` + `aria-busy="true"`; exposes a single `handleClick` where 07 plugs `startGoogleSignIn`.
- Alt texts: logo "Sun* Annual Awards 2025", title art "ROOT FURTHER".

**Checks:** tsc, lint, asset coverage (every Figma image mapped to a `public/login/` file). Hand off to tester for visual validation; E2E stays RED until 07.
