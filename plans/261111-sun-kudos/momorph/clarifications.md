# Clarifications — Sun* Kudos - Live board (MaZUn5xHXZ)

User answers (2026-11-11): data "theo spec" (real DB); scope = Highlight Kudos, Spotlight Board,
recent kudos, filters (hashtag / department), personal stats, top 10 gift recipients.
Everything else below is an agent default — change on request.

| # | Topic | Decision |
|---|-------|----------|
| 1 | Access | Login required (proxy + page check), like `/` and `/awards-information`. |
| 2 | Who gets the hearts | Spec C.4.1 says both "tài khoản gửi" (2x) and "người nhận" (1x). Chosen: the **sender** of the kudos (consistent with "sender cannot heart their own kudos"). `Số tim bạn nhận được` = sum of heart weights on kudos you sent. One-line change in `my_kudos_stats()` if it should be the receiver. |
| 3 | Special days | Table `special_days` (admin fills it; no admin UI). Weight decided by the server's Vietnam date and stored per heart, so removing a heart takes back exactly 1 or 2. |
| 4 | Department filter | Filters by the **receiver's** department. |
| 5 | Stars / hero badge | Stars removed (not in Figma, user 2026-11-13). Badge tier = number of **different Sunners** who sent the person kudos, per the design hover text: 1–4 New, 5–9 Rising, 10–20 Super, >20 Legend (`kudos_feed.*_distinct_senders`, migration 20261116090000). Hover/focus shows the 2x badge, title and description. |
| 6 | Kudos title | Each kudos has a title (Figma "IDOL GIỚI TRẺ") stored in `kudos.title`. |
| 7 | Not built (other screens) | Send-kudos dialog (A.1), profile search pill, "Mở Secret Box" dialog (D.1.8), kudos detail page (`/sun-kudos/<id>`), profile page (`/profile/<id>`), profile hover preview. Buttons/links are in place; targets 404 for now. "Mở Secret Box" is disabled when there is no unopened box. |
| 8 | D lists | Only "10 SUNNER NHẬN QUÀ MỚI NHẤT" (in Figma and in the agreed scope); "10 Sunner có sự thăng hạng mới nhất" is not in the Figma frame. |
| 9 | Spotlight | Word cloud of receivers (size by kudos count, Figma 6.7–11.3px), hover = name + time of latest kudos, click = latest kudos detail, Pan/Zoom toggle (drag + wheel), search highlights + centres the first match (diacritics-insensitive, max 100 chars), live feed of the 5 latest kudos. Total = all kudos in DB. |
| 10 | Assets | No Figma exports needed: keyvisual reuses `public/awards/keyvisual-2025.jpg`, KUDOS logo `public/home/kudos-logo.png`, icons are inline SVG, badge artwork replaced by a styled pill, avatars = Google picture or initials. Seed attachments reuse `public/home/award-*.png`. |
| 11 | Pagination | Highlight: 5 cards, arrows disabled at the ends, pager resets to 1 on filter change. All Kudos: 10 per page, infinite scroll. |
| 12 | Playwright | `workers: 3` — 6 parallel workers overloaded `next dev` (timeouts); 3 is stable. |
