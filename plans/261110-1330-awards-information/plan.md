---
title: "Hệ thống giải (Awards Information)"
momorph_screen: zFYDgyj_pD
figma: 9ypp4enmFmdK3YAFJLIu6C / 313:8436 (1440 x 6164)
route: /awards-information
test_policy: e2e-red-first
status: done
---

# Hệ thống giải — implementation plan

## Scope
| Spec item | Implementation |
|-----------|----------------|
| 3 Keyvisual + Cover | `app/awards-information/_components/awards-keyvisual.tsx` |
| A Title | `app/awards-information/page.tsx` (h1, caption, divider) |
| B / C Menu (C.1–C.6) | `_components/awards-menu.tsx` — click scrolls smoothly, sets active, writes `#slug`; scroll-spy follows reading position (`lib/awards/active-section.ts`) |
| D.1–D.6 Award cards | `_components/award-detail-section.tsx`, copy in `lib/i18n/awards-messages-{vi,en}.ts` |
| D1 / D2 / D2.1 Sun* Kudos | reused `KudosSection` (1152 wide here) |
| Header / Footer | reused, `activePath="/awards-information"` |
| Auth | `/awards-information` added to proxy `PROTECTED_PATHS` + `requireCurrentUser()` |

## Phases
1. E2E RED (`e2e/awards-information.spec.ts`, 7 tests) — done
2. Unit RED→GREEN: scroll-spy helpers, messages, proxy guard — done
3. UI + logic — done
4. Visual check against Figma coordinates (1440 viewport) — done, see `evidence/`
5. Assets exported by the user (icons, keyvisual) — done
