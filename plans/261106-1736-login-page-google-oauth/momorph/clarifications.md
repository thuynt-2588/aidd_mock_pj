# Clarifications — Login (SAA 2025)

MoMorph refs:
- Login: https://app.momorph.ai/p/7e7f6eb3-f873-523b-9b5f-7ce50dc41fbc/page/22c72140-daca-430b-95ea-191d9d15ba64 — screenId `GzbNeVGJHz` (Figma fileKey `9ypp4enmFmdK3YAFJLIu6C`, frame `662:14387`)
- Specs: `momorph/GzbNeVGJHz-specs.csv` (MoMorph V2 `download_screen_spec`, 9 items)
- Test cases: none — MoMorph V2 exposes no test-case tool; behaviour taken from the spec CSV
- testPolicy: e2e-red-first

## Session 2026-11-06

- Q: Supabase local cần Google OAuth Client ID/Secret — đã có chưa? → A: Có, người dùng tự điền. Cấu hình `[auth.external.google]` trong `supabase/config.toml` đọc `env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)` / `env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)` từ `supabase/.env` (không commit).
- Q: Chính sách test khi chưa có E2E runner? → A: Cài `@playwright/test` (người dùng cho phép) → `e2e-red-first`.
- Q: Bộ chọn ngôn ngữ VN/EN làm đến đâu? → A: Làm thật VN/EN — lưu cookie `NEXT_LOCALE`, toàn bộ text trang /login đổi theo ngôn ngữ; dùng từ điển đơn giản, không thêm thư viện i18n.
- Q: Ngôn ngữ viết spec? → A: Tiếng Việt (`vi`).
- Q: Trang /todo chưa tồn tại — làm gì? → A: "theo spec" — chỉ redirect về `/todo` sau đăng nhập thành công; KHÔNG tạo trang /todo (thuộc màn hình khác).
- Q: Người đã đăng nhập vào lại /login hoặc / ? → A: "theo spec" — spec không định nghĩa → không thêm hành vi chuyển hướng/guard nào ngoài spec.
- Q: Logo click? → A: Spec ghi "chưa rõ có điều hướng" → hiển thị tĩnh, không gắn link.
- Q: Tài khoản Google nào được phép? → A: Spec: tất cả tài khoản Google.
- Q: Bản EN cho các đoạn chữ (Figma chỉ có VN)? → A: Dùng bản đề xuất — "Start your journey with SAA 2025." / "Log in to explore!" / "Copyright by Sun* © 2025" / "Sign-in failed. Please try again."; "ROOT FURTHER" và "LOGIN With Google" giữ nguyên.
- Q: Responsive cho màn nhỏ? → A: "theo spec" — spec chỉ có khung desktop 1440px → chỉ làm desktop; bỏ Phase 4 polish phần responsive (người dùng chọn theo spec). Hover/focus của nút vẫn làm (thuộc visual).
- Q: Ảnh (logo, key visual, ROOT FURTHER, icon Google, cờ)? → A: MoMorph V2 API không trả URL ảnh; người dùng cung cấp file vào `public/login/` (đang chờ).
- Q: Lỗi đăng nhập (thất bại / hủy)? → A: Spec: hiển thị "Đăng nhập không thành công. Vui lòng thử lại." trên trang /login.

## Session 2026-11-09

- Q: Nguồn ảnh cho màn Login (logo, key visual, ROOT FURTHER, icon Google, cờ)? → A: Người dùng xác nhận link MoMorph https://app.momorph.ai/p/7e7f6eb3-f873-523b-9b5f-7ce50dc41fbc/page/22c72140-daca-430b-95ea-191d9d15ba64?tab=specs (screenId `GzbNeVGJHz`) đã đủ spec và ảnh → lấy ảnh trực tiếp từ MoMorph MCP, lưu vào `public/login/`. Thay cho quyết định "người dùng tự cung cấp file" ở phiên 2026-11-06. Vẫn cấm ảnh tạm/tự chế.
- Q: MoMorph V2 không trả ảnh, phiên không có quyền Figma — xử lý Phase 06 thế nào? → A: Người dùng yêu cầu "xử lý giúp". Code UI ngay, tham chiếu cố định tới file thật sẽ export từ Figma vào `public/login/`: `logo.png`, `root-further-title12.png`, `keyvisual.jpg`, `google-icon.svg`, `flag-vn.svg`, `chevron-down.svg`. Không tạo ảnh tạm/tự chế; người dùng thả file đúng tên là xong. Mục EN trong menu ngôn ngữ chỉ hiện chữ "EN" (Figma không có cờ EN).
