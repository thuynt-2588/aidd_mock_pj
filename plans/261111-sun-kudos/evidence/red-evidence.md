# RED → GREEN evidence — Sun* Kudos - Live board (MaZUn5xHXZ)

Local Supabase running (Docker), migration applied with `npx supabase migration up`, seed loaded with
`docker exec -i supabase_db_aidd_mock_pj psql -U postgres -d postgres < supabase/seed.sql`.

## E2E (policy: e2e-red-first)
| Step | Command | Result |
|------|---------|--------|
| RED | `npx playwright test e2e/sun-kudos.spec.ts` (no page yet) | 11 failed — `/sun-kudos` 404, no guard, sections / cards not found; sign-up setup succeeded |
| GREEN #1 | same | 9 passed, 2 failed (heart, infinite scroll) |
| Diagnosis | traced Server Action responses | both actions returned correct data; failures were test races under 6 parallel workers (reload while the heart action was in flight → `Error: aborted`; next page slower than the 5s poll). In isolation: page 0.4–0.9s, heart 165ms, filter 312ms, view query < 1ms |
| Fix | tests wait like a user (button enabled again, re-scroll with `toPass`), `workers: 3` | 11/11 twice |
| Full suite | `npx playwright test` | 35 passed, 6 skipped (5 prelaunch "locked" tests — site is open; homepage countdown — `NEXT_PUBLIC_EVENT_START_AT` not in `.env.local`) |

## Unit (Vitest)
| Test | RED | GREEN |
|------|-----|-------|
| `lib/kudos/format.test.ts` (time, stars, badge, hearts, hashtags) | module missing | passed |
| `lib/kudos/filters.test.ts` | module missing | passed |
| `lib/kudos/spotlight-layout.test.ts` | module missing | passed |
| `lib/supabase/proxy-session.test.ts` "also guards /sun-kudos" | 1 failed | passed |
| Whole suite `npm test` | — | 84 passed (12 files) |

## Database rules (SQL as role `authenticated`, rolled back)
- heart on own kudos → `ERROR: cannot heart your own kudos`
- heart as another user → `new row violates row-level security policy`
- client-sent `weight = 2` on a normal day → stored 1; on a `special_days` date → 2
- `kudos_feed.hearted_by_me` true after the heart; `my_kudos_stats()` returns the user's numbers

## Static checks
`tsc --noEmit` OK · `eslint app lib e2e …` OK · `next build` OK (`/sun-kudos` partial prerender).

## Visual (1440 viewport)
| Node | Figma | Built |
|------|-------|-------|
| A title x / w | 144 / 1152 | 144 / 1152 (y 176) |
| B.3 highlight card w | 528 | 528 (centred, x 456) |
| B.7 board | 1157 x 548, radius 47 | 1152 x 546 (content width 1152) |
| C.3 feed card w | 680 | 680 |
| D sidebar w | 422 | 422 |

Screenshots: `visual/kudos-1440-top.png`, `visual/kudos-1440-spotlight.png`, `visual/kudos-1440-all.png`,
`visual/kudos-spotlight-search.png`, `visual/kudos-1440-full.png`.

## UI fix vs Figma (2026-11-12)
New spec `e2e/sun-kudos-figma.spec.ts` (8 tests, 1440 viewport) measures the page against `frame-styles.txt`.

| Step | Result |
|------|--------|
| RED | 7 failed, 1 passed: logo 512 (want 593), list↔sidebar gap 50 (80), board 1152 (1157), no pen icon, A.1→B gap 120 (64), carousel 560 / faded side cards / 48px arrows / next arrow 40px from edge (525 / not faded / 60 / 140), gift text left-aligned. "No x2 badge on a normal day" passed (guard). |
| GREEN | 8/8. Kudos specs 19/19 three runs in a row; full suite 43 passed, 6 skipped; Vitest 84/84. |

Also fixed without a measuring test: D.3 2px scrollbar, ticker 14/20, content letter-spacing 0 at lg, search pill content left-aligned, D.1.4 "x2" badge (shown only when today is in `special_days`; checked by screenshot with a temporary row, removed afterwards). Two-column All Kudos layout now starts at xl (1280) so the list is not squeezed at 1024.

E2E environment: a dev server started without `-H 127.0.0.1` blocked dev assets for 127.0.0.1 and the page never hydrated (17 failures). Fixed with `allowedDevOrigins: ["127.0.0.1"]` in `next.config.ts`. Filter / heart waits raised to 15s: under 3 workers the server re-render or Server Action can exceed 5s (each passes in ~4s alone).

## Designer icons / images (2026-11-12)
New spec `e2e/sun-kudos-assets.spec.ts` (3 tests): every icon is a `public/sun_kudos/icon_*.svg` export, hero badges use `badge-*-hero.png`, Spotlight uses `spotlight-bg.png`.

| Step | Result |
|------|--------|
| RED | 3 failed (hand-drawn SVG icons, text-only badge, keyvisual as Spotlight background) |
| GREEN | 3/3; full suite 46 passed, 6 skipped, twice; Vitest 84/84 |

Icons are applied as CSS masks over `currentColor` (several exports are hard-coded white). Still hand-drawn: "Xem chi tiết" arrow, stars. Missing exports: Spotlight "Root further" texture, image 35 (x2 heart), full-width Legend Hero badge (file is 58x19).

### Designer assets — round 2 (icon_up, Legend badge)

- RED: added `[highlight "Xem chi tiết", "up"]` to `e2e/sun-kudos-assets.spec.ts` → 1 failed (no `[data-icon="up"]`; arrow was hand-drawn).
- GREEN: `KUDOS_ICONS.up = /sun_kudos/icon_up.svg`, `ArrowUpRightIcon` → `MaskIcon name="up"` → assets 3/3; full E2E 46 passed / 6 skipped; Vitest 84/84; tsc + eslint clean.
- `badge-legend-hero.png` replaced (109×17, cover-scaled into the 109×19 badge). New/Rising/Super artwork confirmed identical by design.

### Designer assets — round 3 (Spotlight texture, stars removed)

- RED: assets spec — Spotlight must render only `spotlight-texture.png` with no `bg-black/70` overlay; cards must have no star icons / star hints → 2 failed.
- GREEN: `SPOTLIGHT_BACKGROUND = /sun_kudos/spotlight-texture.png` (opaque, pre-darkened 1157×548 "Root further mo rong 1", covers image 24/25), overlay removed; `StarIcon`, star rendering and `starsHint` messages removed (not in Figma; `starCount` kept for hero badge tiers) → assets 4/4; full E2E 47 passed / 6 skipped; Vitest 84/84; tsc + eslint clean.
- Heart: only `icon_heart.svg` exists → kept as mask (grey = not hearted, red = hearted).

### Highlight card footer (B.4.4) position

- RED: `e2e/sun-kudos-figma.spec.ts` "B.3/B.4.4" — card must be 533 high with the action row at y 457 (Figma: B.4 fixed 240, content box 120), hearts 32 high → received 543 (content box grew to 130 with 3×32px lines, hearts 40). Then `overflow-y` of the 525px viewport must be visible → received "hidden" (card borders clipped).
- GREEN: highlight B.4 `lg:h-60 justify-center`, content box `lg:h-[120px] overflow-hidden` (3-line clamp kept), heart icon wrapper `flex`; viewport `overflow-x-clip`, gradients `-inset-y-1` → figma spec 9/9; full E2E 48 passed / 6 skipped; Vitest 84/84; tsc + eslint clean.

### Highlight action row order (user feedback)

- User: "tim trái, copy link giữa, xem chi tiết phải".
- RED: figma spec "B.3/B.4.4" — heart at x 28 from the card, Xem chi tiết 28 from the right edge, Copy Link between → received heart at x 440.
- GREEN: `KudoActions` highlight row = hearts · Copy Link · Xem chi tiết (justify-between); feed row unchanged (Copy Link left · hearts right) → full E2E 48 passed / 6 skipped; Vitest 84/84; tsc + eslint clean.

### B.5.2 pager style (user reference image)

- RED: figma spec "B.5.2" — current page in its own span, #FFEA9E 40px; "/5" #999 28px → element not found.
- GREEN: pager = baseline row, current page `text-[40px] leading-[48px] text-saa-accent`, "/total" 28/36 `text-saa-muted` (size ratio 1.46 measured from the reference) → full E2E green; Vitest 84/84; tsc + eslint clean.

### B.5.2 pager — "/total" smaller and lighter (user feedback)

- Pixel measure of the reference: "2" cap 19px vs "5" cap 12px (≈1.6x); "/5" strokes ≈17% of cap height (semibold), "2" bold.
- RED: figma spec "B.5.2" expects "/total" 24px → received 28px.
- GREEN: "/total" `text-2xl font-semibold leading-8`, current page `text-[40px] font-bold`; Montserrat weight 600 added in `app/layout.tsx` → rendered ratio 1.65; full E2E green; Vitest 84/84; tsc + eslint clean.

### B.7 Spotlight layout + background layers (user reference image)

- `spotlight-bg.png` is a semi-transparent layer (30% black + white network lines, alpha 76 everywhere) → it belongs ON TOP of the opaque `spotlight-texture.png`, normal blend.
- RED: figma spec "B.7.1/B.7.2/B.7.3" (search 24/24 from the top-left inner edge, total centred 16px from the top, Pan/Zoom 40/40 from the bottom-right) → received search at the top-right; assets spec expects 2 images (texture, then network) → received 1.
- GREEN: `SPOTLIGHT_TEXTURE` + `SPOTLIGHT_NETWORK` stacked; total `absolute inset-x-0 top-4 text-center`; search `absolute left-6 top-6`; Pan/Zoom `absolute bottom-10 right-10`; "not found" status under the search → full E2E green; Vitest 84/84; tsc + eslint clean.

### C.4 feed action row order (user feedback)

- RED: figma spec "C.4: feed card hearts left, Copy Link right" (heart 40px from the card's left, Copy Link 40px from the right) → received heart at x 580.
- GREEN: feed row = hearts · Copy Link (justify-between), same order as the highlight row → full E2E 51 passed / 6 skipped; Vitest 84/84; tsc + eslint clean.

### Hero badge styles + hovers, campaign icon (user design image)

- Unit RED: `heroBadge` by distinct senders (1–4 New, 5–9 Rising, 10–20 Super, >20 Legend) + `fillSpecialDayRange` → 5 failed. GREEN after `format.ts` change (star tiers removed) → Vitest 81/81.
- DB: migration `20261116090000_hero_badge_senders.sql` appends `sender_distinct_senders` / `receiver_distinct_senders` to `kudos_feed`; applied with `supabase migration up`.
- E2E RED (`e2e/sun-kudos-badges.spec.ts`): badge hover (title per tier, 218×38 badge, description), keyboard focus, Rising "Rising" lime / "Hero" white, special-day campaign icon + hover text → 4 failed (normal-day test passed). The special day is inserted for that serial block through the local Supabase container and removed afterwards.
- GREEN: `hero-badge.tsx` (pill 1x/2x, tier word styles, hover card), sidebar `CampaignIcon` (`icon_campain.svg` + white "x2", black stroke) with hover "Ngày x2 tim – lan tỏa gấp đôi yêu thương!" / "Từ 00:00 ngày DD/MM đến 23:59 ngày DD/MM, …". Second RED/GREEN for the "x2" overlay. Full E2E 55 passed / 6 skipped; tsc + eslint clean; special_days left empty.

### Rising colour #CDFF60 + every tier in the seed (user request)

- RED: badges spec — "Rising" colour rgb(205, 255, 96) (received rgb(212, 240, 70)); new test "seed shows every tier" (Super + Legend badges with their hover titles) → no Super/Legend badge in the data.
- GREEN: `hero-badge.tsx` Rising `#cdff60`; `supabase/seed.sql` adds 20 "Sunner Fan" accounts sending older kudos → Nguyễn Văn Quy 25 senders (Legend), Nguyễn Hoàng Linh 15 (Super), Huỳnh Dương Xuân 6 (Rising), others 3 (New); seed re-applied locally (idempotent). Test fixes during GREEN: match the tooltip title next to the hovered badge, use All Kudos cards (carousel side cards are inert). Full E2E 56 passed / 6 skipped.
- For the manual UI check, today (Vietnam date) was added to `special_days` in the LOCAL DB only (not in the seed).
- Test fix: psql `-q` so the campaign test no longer mistakes the "INSERT 0 0" status line for its own insert (it had deleted a pre-existing special day).

### Hero badges = designer images only (user request)

- New `badge-*-hero.png` files (2x, ~220×40) already contain the title, colours and border.
- RED: assets/badges specs expect `hero-badge` to be an `<img>` (alt = tier name, src badge-<tier>-hero.png, 109×19), the hover badge an image 218×38, and each tier its own file → 4 failed.
- GREEN: `hero-badge.tsx` renders `next/image` only (old CSS text/colour/border styles removed; hover copy is `alt=""`) → full E2E 55 passed / 7 skipped (normal-day test skips while today is a special day locally); Vitest 81/81; tsc + eslint clean.

### Campaign icon right after the label (user reference image)

- RED: campaign test — gap between the end of the label TEXT (Range rect) and the icon ≤ 8px, value flush right → received 48.8px. (A first version measured the stretched label box and passed wrongly; fixed to measure the text.)
- GREEN: `StatRow` = [label + badge, gap 4px, flex-1] [value right] → full E2E 55 passed / 7 skipped; tsc + eslint clean.
