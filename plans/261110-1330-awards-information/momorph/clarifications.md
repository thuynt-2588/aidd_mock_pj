# Clarifications — Hệ thống giải (zFYDgyj_pD)

Decisions taken (same rules as the homepage: Figma text wins over spec text).

| # | Topic | Decision |
|---|-------|----------|
| 1 | Access | Login required, like `/` (proxy + page-level check). |
| 2 | Top Talent quantity | Figma "10 Cá nhân" (spec says "10 Đơn vị"). |
| 3 | Menu C.6 label | "MVP" (Figma), card title stays "MVP (Most Valuable Person)". |
| 4 | Active menu item | Click → smooth scroll + active; also follows the scroll position (scroll-spy); `#slug` deep links from homepage cards open the matching award. Reduced-motion users get an instant jump. |
| 5 | Line breaks | From the user's Figma screenshots: D.5 / D.6 have a blank line between paragraphs ("\n\n"); D.6 uses Figma line separators (U+2028) for a new line; the user asked to keep normal word spacing on the line before (no full-width stretch like Figma); units stack as "Cá / nhân / hoặc / tập thể" and "Cá / nhân". |
| 6 | Award pictures | Reuse `/public/home/award-*.png` (same artwork as homepage cards). |
| 7 | Keyvisual | `public/awards/keyvisual-2025.jpg` (1440x547) = user's export of node 2167:5138 as shown in Figma, placed 1:1 under the header. |
| 8 | Quick-action widget | Not in this Figma frame → not rendered. |

## Open — needs the user
- Icons and keyvisual: exported by the user into `public/awards/` (done).
- D.5 / D.6 height: fixed from the user's Figma screenshots — now 1047 / 730 like Figma (done).
