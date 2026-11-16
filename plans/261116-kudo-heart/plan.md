---
title: "Thả tim - heart a kudos (C.4.1)"
momorph_screen: MaZUn5xHXZ (Sun* Kudos - Live board), items C.4.1 / B.4.4 / B.2.3
route: /sun-kudos
test_policy: e2e-red-first
status: done
---

# Thả tim — implementation plan

No separate MoMorph screen: the rules are spec item C.4.1 of the Live board.
The basic toggle, the database rules and the x2 special day were built with
Sun* Kudos (`plans/261111-sun-kudos`). This round closes the gaps.

## Rules (C.4.1) and where they live
| Rule | Where |
|------|-------|
| One heart per user per kudos | `kudo_hearts` primary key (kudo_id, user_id) |
| Sender cannot heart own kudos (button disabled + tooltip) | trigger `kudo_hearts_before_insert`; `kudo-actions.tsx` |
| +1 heart for the kudos sender, +2 on an admin special day; un-heart takes back exactly that | `kudo_hearts.weight` set by the trigger (server date, Asia/Ho_Chi_Minh) |
| Grey / red heart, count up / down, disabled while saving | `kudo-actions.tsx` |

## Changes this round
| Gap | Fix |
|-----|-----|
| The same kudos in Highlight and All Kudos kept two separate states | `app/sun-kudos/_components/kudo-hearts.tsx`: `KudoHeartsProvider` (in `page.tsx`) + `useKudoHeart`, keyed by kudos id |
| A failed save was undone silently | undo + toast `heartFailed` ("Không thể thả tim lúc này. Vui lòng thử lại.") |
| `toggleKudoHeartAction` flipped whatever was in the DB (two crossed requests could flip twice / hit the unique key) | `setKudoHeartAction(kudoId, hearted)`: the client sends the state it wants; insert is `on conflict do nothing` |

## Tests
- `e2e/kudo-heart.spec.ts` (project `chromium-writes`; kudos made in SQL as `E2EH …`, deleted after): Highlight ↔ All Kudos sync, own kudos disabled, failed save undone + toast.
- Existing: `e2e/sun-kudos.spec.ts` "C.4.1: heart toggles the count and the active state" (persisted after reload).

## Evidence
| Step | Result |
|------|--------|
| RED `npx playwright test e2e/kudo-heart.spec.ts` | sync: Highlight card stayed `aria-pressed=false`; failed save: no toast. Own-kudos test passed already (regression guard). |
| GREEN same + `e2e/sun-kudos.spec.ts` | 15 passed |
| Full suite `npx playwright test` | 67 passed, 7 skipped (same env skips as before) |
| `npx vitest run` / `tsc --noEmit` / `eslint` | 111 passed / OK / OK |
