---
title: "Viết Kudo - Send kudos dialog"
momorph_screen: ihQ26W78P2
figma: 9ypp4enmFmdK3YAFJLIu6C / 520:11602 (modal 752 x 1012 over the 1440 board)
route: /sun-kudos (dialog opened by A.1 "Hôm nay, bạn muốn gửi lời cảm ơn…")
related: OyDLDuSGEa (Add link box), p9zO-c4a4x (Dropdown list hashtag)
test_policy: e2e-red-first
status: done
---

# Viết Kudo — implementation plan

Design data: `momorph/` (spec CSVs, frame overview / styles, `design-1440.png`,
`hashtag-dropdown.png`, `addlink-box.png`). Decisions: `momorph/clarifications.md`.

## Data (Supabase)
| What | Where |
|------|-------|
| `kudos.is_anonymous`, `kudos.anonymous_name`, `kudos.content_doc` (rich text JSON) | `supabase/migrations/20261116120000_write_kudo.sql` |
| RPC `create_kudo(...)` — one transaction: kudos row + hashtags, all rules re-checked in SQL | same |
| `kudos_feed` hides the sender of an anonymous kudos (name = chosen alias, no id / avatar / department) | same |
| Storage bucket `kudo-images` (public read, 5 MB, png/jpeg/webp/gif, upload only into `<uid>/`) | same |
| `search_sunners(q)` for the recipient picker and `@` mentions | same |

## UI
| Spec item | Implementation |
|-----------|----------------|
| A.1 trigger | `app/sun-kudos/_components/write-kudo/write-kudo-launcher.tsx` (replaces the inert pill) |
| Modal, A, Danh hiệu, G, H | `write-kudo-dialog.tsx` |
| B / B.1 / B.2 | `recipient-picker.tsx` (autocomplete via `searchSunnersAction`) |
| C.1–C.6, D, D.1, Tiêu chuẩn cộng đồng | `kudo-editor.tsx` (contentEditable + toolbar, `@` mentions), `add-link-box.tsx` (OyDLDuSGEa) |
| E / E.1 / E.2 | `hashtag-picker.tsx` (p9zO-c4a4x: toggle list, max 5, chips with x) |
| F / F.1–F.5 | `image-picker.tsx` (max 5, thumbnails with red x, "+ Image" hidden at 5) |
| Rich text model | `lib/kudos/kudo-doc.ts` (normalise + plain text) — rendered by `kudo-content.tsx` on cards |
| Validation | `lib/kudos/write-kudo.ts` (shared by dialog + `createKudoAction`) |
| Server Functions | `app/sun-kudos/actions.ts` (`searchSunnersAction`, `createKudoAction`) |
| Copy vi / en | `lib/i18n/kudos-messages.ts` (`write` block) |

## Tests
| What | Where |
|------|-------|
| E2E (8) | `e2e/write-kudo.spec.ts` — Playwright project `chromium-writes`, runs after the read-only specs and deletes its `E2E …` kudos |
| Unit | `lib/kudos/kudo-doc.test.ts`, `lib/kudos/write-kudo.test.ts` |

## Phases
1. E2E RED `e2e/write-kudo.spec.ts` — done
2. Migration, verified with SQL as `authenticated` — done
3. UI + Server Functions + unit tests — done
4. Full suite + visual check at 1440 (`evidence/`) — done
