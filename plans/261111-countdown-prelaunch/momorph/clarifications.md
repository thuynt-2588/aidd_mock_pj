# Clarifications — Countdown - Prelaunch page (8PJQswPZmU)

Defaults taken by the agent, updated with the user's answer of 2026-11-11 (rows 2–4).

| # | Topic | Decision |
|---|-------|----------|
| 1 | Route / access | `/prelaunch`, public (no login, no header/footer — none in Figma). |
| 2 | Target datetime | **User:** countdown to the moment the SAA website opens. New env `NEXT_PUBLIC_SITE_OPEN_AT` (ISO-8601), separate from the homepage event start `NEXT_PUBLIC_EVENT_START_AT`. Spec mentions an API (TODO) — env until it exists. |
| 3 | Navigation lock | **User:** always on — before the opening time the proxy redirects every page (incl. `/login`) to `/prelaunch`. Only an unset/invalid `NEXT_PUBLIC_SITE_OPEN_AT` disables it. (The earlier opt-in `NEXT_PUBLIC_PRELAUNCH_LOCK` was removed.) |
| 4 | Unlock at zero | Exact time (not minute display): the page `router.replace("/")`; the proxy sends `/prelaunch` → `/` once open or when no opening time is set. A browser clock ahead of the server can bounce `/` ↔ `/prelaunch` for those few seconds. |
| 5 | Update rate | Every second (spec), display stays days/hours/minutes; days are not capped at 99. |
| 6 | Background | `public/prelaunch/bg.png` = user's export of node 2268:35129 as cropped in Figma (1512x1077, raw image without the Cover). The Cover gradient (2268:35130, 18deg) is drawn on top in code. |
| 7 | Labels | DAYS / HOURS / MINUTES stay English uppercase in both locales (Figma); title VI "Sự kiện sẽ bắt đầu sau", EN "Event starts in". |
| 8 | Layout | Content block at Figma y=314 in a 1077-tall viewport (centred with a 184px upward offset); units wrap on narrow screens. |
