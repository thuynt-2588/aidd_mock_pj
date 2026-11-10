# Phase 05 — i18n dictionary + NEXT_LOCALE cookie (Track B)

## Context Links
- clarifications (EN texts, no i18n lib), functional-spec §13, tech-spec §3.2 A4, research §5
- Next docs: `04-functions/cookies.md`, `01-getting-started/08-caching.md` (cacheComponents)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz · testPolicy: e2e-red-first

## Overview
Priority P1 · Status pending · Owner `implementer`. Plain dictionary, locale resolver, Server Action that sets the cookie.

## Key Insights
- Cookie writes allowed only in Server Action / Route Handler; Server Action re-renders the route in the same roundtrip.
- `cacheComponents: true` → `getLocale()` callers must sit inside `<Suspense>` (handled in 07).

## Requirements
- `Locale = 'vi' | 'en'`; `parseLocale(v)` → `en` only if exactly `en`, else `vi` (BR-002).
- Keys: `intro1`, `intro2`, `loginButton` ("LOGIN With Google" both), `loginError`, `footer`, `languageLabel` (VN/EN), `logoAlt`, `titleAlt` ("ROOT FURTHER" both).
- VN/EN strings exactly per clarifications + functional-spec §13.
- `setLocaleAction(locale)`: validates, sets `NEXT_LOCALE` (`path=/`, `sameSite=lax`, `maxAge=1y`).

## Architecture
`locale-config.ts` (type, cookie name, default, parse) ← `get-locale.ts` (server, `await cookies()`) and `set-locale-action.ts` ("use server"); `messages.ts` dictionary + `getMessages(locale)`.

## Related Code Files
- Create: `lib/i18n/locale-config.ts`, `lib/i18n/messages.ts`, `lib/i18n/get-locale.ts`, `lib/i18n/set-locale-action.ts`

## Implementation Steps
1. Write config + dictionary (typed so EN must have every VN key).
2. Write `getLocale()` and `setLocaleAction()`; reject invalid input silently.
3. tsc + lint.

## Todo List
- [ ] config + parse
- [ ] dictionary vi/en
- [ ] getLocale
- [ ] setLocaleAction

## Success Criteria
Compiles; dictionary keys identical in both locales (type-enforced); invalid value never written to cookie.

## Risk Assessment
- Missing EN key → type error at build (designed in).

## Security Considerations
Action accepts only the two literals; no user string reflected into cookie.

## Next Steps
07 consumes. Locale E2E tests go GREEN only after 07.

## Rollback
Delete `lib/i18n/`.
