---
feature: homepage-saa
lang: vi
source: MoMorph i87tDx10uM (Homepage SAA, frame 2167:9026)
status: draft
---

# Functional spec — Homepage SAA (`/`)

Quyết định: `../../momorph/clarifications.md`. Chữ hiển thị (VN nguyên văn Figma + EN): `lib/i18n/home-messages.ts`.

| Item | Thành phần | Hành vi |
|------|-----------|---------|
| — | Truy cập | Chưa có phiên → `/login`. Đăng nhập Google xong → `/` |
| A1 | Header sticky 80px, nền rgba(16,20,23,.8) | Logo (→ `/`), 3 link, chuông, ngôn ngữ, avatar |
| A1.2/1.3/1.5 | "About SAA 2025" `/` (selected: vàng + gạch chân), "Awards Information" `/awards-information`, "Sun* Kudos" `/sun-kudos` | hover nền sáng; click link đang chọn → cuộn đầu trang |
| A1.6 | Chuông 40×40 | Chỉ hiển thị |
| A1.7 | VN/EN | Cookie `NEXT_LOCALE` |
| A1.8 | Avatar 40×40 viền #998C5F | Dropdown Profile (`/profile`) / Sign out (→ `/login`); Esc / click ngoài đóng |
| 3.5 | Keyvisual nền 1512×1392 + Cover gradient 12deg | Tĩnh |
| B1 | "Coming soon" + DAYS/HOURS/MINUTES (2 chữ số) | Đếm ngược tới `NEXT_PUBLIC_EVENT_START_AT`, cập nhật mỗi phút; hết/thiếu/sai → 00 và ẩn "Coming soon" |
| B2 | Thời gian `26/12/2025`, Địa điểm `Âu Cơ Art Center`, `Tường thuật trực tiếp qua sóng Livestream` | Tĩnh |
| B3 | "ABOUT AWARDS" (vàng) → `/awards-information`; "ABOUT KUDOS" (viền) → `/sun-kudos` | hover/focus |
| B4 | Ảnh ROOT FURTHER nhỏ + 2 đoạn + trích dẫn | Tĩnh |
| C1/C2 | "Sun* annual awards 2025" / "Hệ thống giải thưởng" + 6 thẻ (ảnh 336², tiêu đề, mô tả ≤2 dòng, "Chi tiết") | Click → `/awards-information#<slug>`; hover nâng + sáng; 3 cột / 2 cột |
| D1 | Sun* Kudos: label, tiêu đề, mô tả, "Chi tiết" → `/sun-kudos`, ảnh nền | Tĩnh trừ nút |
| 6 | Widget pill vàng 106×64, cố định góc phải dưới | Chỉ hiển thị |
| 7 | Footer: logo, 4 link (thêm "Tiêu chuẩn chung" `/standards`), bản quyền | Như header |

Slug: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`.

## Tiêu chí chấp nhận (E2E)
1. Chưa đăng nhập vào `/` → `/login`.
2. Có phiên → thấy header, countdown, 6 thẻ, Kudos, footer.
3. href đúng: thẻ Top Talent `/awards-information#top-talent`, CTA, link header/footer.
4. Avatar mở menu Profile + Sign out; Esc đóng; Sign out → `/login`, sau đó `/` bị chặn.
5. Countdown: mốc tương lai → "Coming soon" + số; quá khứ → 00, không "Coming soon".
6. Cookie EN → chữ đổi sang tiếng Anh.
