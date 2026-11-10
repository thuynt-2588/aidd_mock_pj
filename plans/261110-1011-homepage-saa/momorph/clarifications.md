# Clarifications — Homepage SAA (SAA 2025)

MoMorph refs:
- Homepage SAA: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM — screenId `i87tDx10uM`, frame `2167:9026`, project `7e7f6eb3-f873-523b-9b5f-7ce50dc41fbc` (board page `281f097f-4069-43e0-9f15-142ef51b4f33`)
- Specs: MoMorph V2 `download_screen_spec` — 44 active items; summary `spec/homepage-saa/functional-spec.md`
- Texts: `momorph/i87tDx10uM-texts.md`
- testPolicy: e2e-red-first

## Session 2026-11-09 (lặp lại cho lần làm 2026-11-10 — người dùng không đổi)

- Q: Homepage ở đâu, bắt buộc đăng nhập? → A: `/`, bắt buộc; chưa có phiên → `/login`; đăng nhập xong → `/` (thay `/todo`).
- Q: Trang đích chưa có? → A: Route cố định chưa làm trang: `/awards-information#<slug>`, `/sun-kudos`, `/standards` (tạm 404).
- Q: Panel/menu? → A: Chỉ menu tài khoản: Profile (`/profile`, chưa có trang) + Sign out thật. Admin Dashboard không hiện (chưa có nguồn role). Chuông + Widget chỉ hiển thị.
- Q: Giờ sự kiện? → A: Người dùng tự điền `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601) trong `.env.local`; thiếu/sai/đã qua → 00 + ẩn "Coming soon".
- Mặc định: VN/EN dùng cookie `NEXT_LOCALE` + từ điển; EN do agent đề xuất; tên riêng giữ nguyên.
- Mặc định: Lưới giải 3 cột desktop / 2 cột < 1024px. Desktop 1512 là khung chuẩn.
- Mặc định: Ảnh export từ Figma vào `public/home/`; không tạo ảnh giả. Avatar = icon mặc định Figma.
- Mặc định: Chữ hiển thị theo Figma khi khác spec (Figma mới hơn): `26/12/2025`, `Âu Cơ Art Center`, `Tường thuật trực tiếp qua sóng Livestream`; "Comming soon" (lỗi chính tả Figma) → `Coming soon`.
