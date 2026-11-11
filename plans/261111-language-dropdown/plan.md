---
title: "Dropdown-ngôn ngữ (language dropdown)"
momorph_screen: hUyaaugye2
figma: 9ypp4enmFmdK3YAFJLIu6C / 721:4942 (list 525:11713)
route: component — header of /login, /, /awards-information
test_policy: e2e-red-first
status: done
---

# Dropdown-ngôn ngữ — implementation plan

## Scope
The dropdown already existed (`LanguageSelector`, login feature). This screen brings the open list in line with Figma.

| Spec item | Implementation |
|-----------|----------------|
| A Dropdown-List | `app/login/_components/language-selector.tsx` — panel 1px `--saa-border` (#998C5F), `--saa-container-2` (#00070C), radius 8, padding 6; click toggles, Escape / outside click close |
| A.1 tiếng Việt | item 110x56, VN flag; selected → `--saa-accent-selected` rgba(255,234,158,0.2), radius 2 |
| A.2 tiếng Anh | item 110x56, UK flag `public/login/flag-en.svg` (Figma export by the user, 20x15 in a 24x24 slot); choosing it closes the list and sets the `NEXT_LOCALE` cookie (existing server action) |
| a11y | items are `menuitemradio` with `aria-checked` (was `menuitem`); `e2e/login.spec.ts` updated accordingly |

## Phases
1. RED: `e2e/language-dropdown.spec.ts` (5 tests) — done
2. GREEN: component + tokens + flag — done
3. Visual: list 124x126 = Figma (110 + 2x6 + 2x1; 2x56 + 12 + 2) — `evidence/visual/`
