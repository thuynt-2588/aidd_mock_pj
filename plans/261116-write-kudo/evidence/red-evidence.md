# RED → GREEN evidence — Viết Kudo (ihQ26W78P2)

Design pulled from MoMorph (spec CSVs, frame overview / styles, SVG rendered to `momorph/design-1440.png`).
Local Supabase (Docker); migration applied with `npx supabase migration up`.

## E2E (policy: e2e-red-first) — `e2e/write-kudo.spec.ts`
| Step | Command | Result |
|------|---------|--------|
| RED | `npx playwright test e2e/write-kudo.spec.ts` (dialog not built) | 7 failed — A.1 opened nothing, dialog not found |
| GREEN #1 | same | 5 passed, 2 failed: new card not on the board (KudosFeed kept its first `initial` in state, so `refresh()` never reached it); anonymous checkbox not clickable (sr-only input) |
| GREEN #2 | same | 6 passed, 1 failed: bold text not saved — the editor's base text was bold, so Chrome's `bold` command saw it as bold already and turned it *off* (`<span style="font-weight: normal">`) |
| GREEN #3 | + test D (`@` mention) | 8/8 |
| Full suite #1 | `npx playwright test` | 3 old specs failed: kudos left by the new tests pushed the seed's Super / Legend cards down and added senders to seed Sunners; the card's new "open detail" overlay link was named "Xem chi tiết: …" (strict-mode clash) |
| Fix | write spec runs as project `chromium-writes` after the read-only project and deletes its `E2E …` kudos in `afterAll`; overlay link named by the message (as the old whole-box link) | |
| Full suite #2, #3 | `npx playwright test` | 64 passed, 7 skipped (prelaunch ×5 and homepage countdown — env; "no campaign icon" — skipped when today is in `special_days`), twice in a row |

## Unit (Vitest)
| Test | Result |
|------|--------|
| `lib/kudos/kudo-doc.test.ts` (normalise, reject html / javascript: / data: links / bad mention, plain text, mentions) | passed |
| `lib/kudos/write-kudo.test.ts` (draft validation, own-folder images only, H.2 completeness, image type / size, link box) | passed |
| Whole suite `npx vitest run` | 111 passed (14 files) |

Written together with the code (not before it).

## Database rules (SQL as role `authenticated`, rolled back)
- `search_sunners('do hoang')` → Đỗ Hoàng Hiệp (diacritics ignored); own name → 0 rows
- `create_kudo` to yourself → `invalid receiver`; 0 or 6 hashtags / unknown hashtag → `invalid hashtags`;
  image in another user's folder → `invalid images`; blank title → `invalid title`
- valid call → kudos + 2 hashtags in one transaction
- anonymous kudos in `kudos_feed`: sender sees own `sender_id`; another user gets `sender_id` null, alias name, no avatar, badge count 0
- direct `insert into kudos` → `new row violates row-level security policy`

## Static checks
`tsc --noEmit` OK · `eslint` OK · `next build` OK (`/sun-kudos` partial prerender).

## Visual (1440 x 1024)
| Node | Figma | Built |
|------|-------|-------|
| Modal | 752 wide, radius 24, padding 40, top 10 | 752 wide, x 344 (centred), top 10 |
| Editor (D) | 672 x 200 | 672 x 200 |
| Gửi (H.2) | 502 x 60 | 500 x 60 |
| Hủy (H.1) | padding 16/40 | 148 x 60 |

Figma places the modal at x 357 (13px right of centre); built centred. Screenshots in `visual/`:
`write-kudo-1440-empty.png`, `write-kudo-1440-filled.png`, `write-kudo-1440-hashtag-list.png`, `write-kudo-add-link.png`.
