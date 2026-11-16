# Clarifications — Viết Kudo (ihQ26W78P2)

No user answers yet (2026-11-16): every row below is an agent default — change on request.
MoMorph has no image / text data for the related frames "Lỗi chưa điền đủ thông tin" (5c7PkAibyD),
"Dropdown list người nhận" (QIMJNgFb8K) and "Ẩn danh" (p9vFVBE_tc); those parts follow the main spec.

| # | Topic | Decision |
|---|-------|----------|
| 1 | Where | Modal over `/sun-kudos`, opened by A.1. Esc, the backdrop and "Hủy" close it and drop the draft. |
| 2 | Danh hiệu | In Figma (not in the spec CSV). Required, 1–100 chars, stored in `kudos.title` (the card title). |
| 3 | Recipient | Any other Sunner (`profiles`), searched by name (diacritics-insensitive, 10 results). You cannot send to yourself. |
| 4 | "Gửi" state | Spec H.2: disabled until recipient, Danh hiệu, content and ≥1 hashtag are filled. Server errors are shown under the field / above the buttons. |
| 5 | Content | Required, max 1000 characters of text (counter "n/1.000" under the editor, design update 2026-11-16; "Gửi" disabled above it). Stored twice: `content` (plain text, used by the existing cards' clamp) and `content_doc` (JSON: paragraphs, numbered list, quote; bold / italic / strike / link / mention). Never HTML — cards render the JSON with React, links only http(s). |
| 6 | `@` mentions | Typing `@` + name opens a list of Sunners; the pick is inserted as a mention (bold, links to the profile). |
| 7 | Link (C.5) | "Thêm đường dẫn" box (OyDLDuSGEa): Nội dung 1–100 chars, URL http/https 5–2048 chars. Opens in a new tab on the card. |
| 8 | Hashtags | Chosen from the `hashtags` table (spec p9zO-c4a4x: list from DB), 1–5; unselected rows disabled at 5. No free-text new hashtag. |
| 9 | Images | Optional, max 5, png / jpeg / webp / gif ≤ 5 MB each. Uploaded to Storage `kudo-images/<uid>/` when "Gửi" is pressed (cancelled drafts leave no files). |
| 10 | Anonymous (G) | Ticking the checkbox (checked = gold #998C5F, white tick) shows "Nickname ẩn danh*" — required, 1–50 chars; "Gửi" stays disabled until it is filled, and `create_kudo` rejects an anonymous kudos without one (per the user's mock-up). The board shows the alias with no avatar / department / badge / profile link. Known limit: the `kudos` table itself stays readable (RLS select for signed-in users), so a technical user could still read `sender_id`. Stats still count it for the real sender. |
| 11 | "Tiêu chuẩn cộng đồng" | Link to `/sun-kudos/community-standards` (screen not built; 404 for now), new tab. |
| 12 | Text weight | Typed text in D looks bold (design). Done with the variable Montserrat's `wght` axis while `font-weight` stays 400 — a bold font-weight makes the browser's Bold button un-bold. **B** text is heavier (wght 900). Rich-text cards use the same styling. |
| 13 | After sending | Dialog closes, toast "Đã gửi Kudos!", board refreshes (new card first in All Kudos). |
