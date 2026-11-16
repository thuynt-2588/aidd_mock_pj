---
title: "Sun* Kudos - Live board"
momorph_screen: MaZUn5xHXZ
figma: 9ypp4enmFmdK3YAFJLIu6C / 2940:13431 (1440 x 5862)
route: /sun-kudos
test_policy: e2e-red-first
status: done
---

# Sun* Kudos - Live board — implementation plan

Scope agreed with the user (6 features): Highlight Kudos (top 5 by hearts), Spotlight Board,
recent kudos (All Kudos), filters by hashtag / department, personal stats, 10 latest gift recipients.
Data "theo spec": real Supabase tables.

## Data (Supabase)
| What | Where |
|------|-------|
| Tables `departments`, `profiles` (trigger from `auth.users`), `hashtags`, `kudos`, `kudo_hashtags`, `kudo_hearts`, `special_days`, `secret_boxes` + RLS | `supabase/migrations/20261111120000_sun_kudos.sql` |
| Heart rules C.4.1 (one per user, no self-heart, x2 on special day, weight kept for exact take-back) | trigger `kudo_hearts_before_insert` + RLS insert/delete own |
| Read views `kudos_feed`, `kudos_receiver_stats`, `recent_gift_recipients`, RPC `my_kudos_stats()` | same migration |
| Sample data (8 Sunners, 60 kudos, hashtags, hearts, boxes) | `supabase/seed.sql` |

## UI
| Spec item | Implementation |
|-----------|----------------|
| A / A.1 | `app/sun-kudos/_components/kudos-hero.tsx` (keyvisual, title, KUDOS logo, send pill, profile search pill) |
| B.1 / B.1.1 / B.1.2 | `kudos-section-header.tsx`, `filter-dropdown.tsx` (URL `?hashtag=&department=`) |
| B.2 / B.3 / B.4 / B.5 | `highlight-carousel.tsx`, `kudo-card.tsx` (variant highlight), `kudo-actions.tsx`, `kudo-person.tsx` |
| B.6 / B.7 (B.7.1–B.7.3) | `spotlight-board.tsx` + `lib/kudos/spotlight-layout.ts` |
| C / C.2–C.7 | `kudos-feed.tsx` (infinite scroll, `loadMoreKudosAction`), `kudo-card.tsx` (variant feed) |
| D.1 / D.3 | `kudos-sidebar.tsx` |
| Copy Link toast | `kudos-toast.tsx` |
| Server Functions | `app/sun-kudos/actions.ts` (`toggleKudoHeartAction`, `loadMoreKudosAction`) |
| Reads | `lib/kudos/kudos-queries.ts`; formatting `lib/kudos/format.ts`; filters `lib/kudos/filters.ts` |
| Copy vi / en | `lib/i18n/kudos-messages.ts` |
| Auth | `/sun-kudos` in proxy `PROTECTED_PATHS` + `requireCurrentUser()` |

## Phases
1. E2E RED `e2e/sun-kudos.spec.ts` (11 tests) + unit RED (format, filters, spotlight layout, proxy guard) — done
2. Migration + seed, verified with SQL as an `authenticated` user — done
3. UI + Server Functions — done
4. Full suite + visual check at 1440 — done (`evidence/`)
