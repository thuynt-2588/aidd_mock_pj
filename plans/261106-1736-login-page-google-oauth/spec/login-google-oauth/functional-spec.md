---
status: draft
authored_by: takumi
created: 2026-11-06
lang: vi
---

**Priority**: P0
**Type**: ui

## 1. Overview

**Problem:** Người dùng SAA 2025 (Sun* Annual Awards 2025) cần một cửa vào duy nhất để đăng nhập vào ứng dụng, và cần đọc được trang này bằng tiếng Việt hoặc tiếng Anh.
**Solution:** Màn hình Login hiển thị giới thiệu chương trình và một nút "LOGIN With Google"; đăng nhập thành công thì chuyển người dùng sang trang `/todo`, thất bại thì báo lỗi ngay trên trang. Bộ chọn ngôn ngữ VN/EN ở đầu trang đổi toàn bộ chữ và nhớ lựa chọn cho lần sau.
**Scope:** Màn hình Login (header, hero, giới thiệu, nút Google, footer), luồng đăng nhập Google, thông báo lỗi và bộ chọn ngôn ngữ VN/EN.
**Non-Scope:** Trang `/todo` (thuộc màn hình khác); các cách đăng nhập khác ngoài Google; phân quyền hay giới hạn tài khoản; chuyển hướng hay chặn truy cập cho người đã đăng nhập (spec không nêu); điều hướng khi bấm logo.

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách chưa đăng nhập | Người có tài khoản Google, mở trang Login | Đăng nhập vào SAA 2025 bằng tài khoản Google, đọc trang bằng ngôn ngữ mình chọn |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Đăng nhập bằng Google | Bấm "LOGIN With Google", đăng nhập ở Google rồi vào `/todo`, hoặc thấy lỗi và thử lại | US001, US002 | FR-001, FR-101, FR-201, FR-202, FR-203, FR-204, FR-401, FR-402, FR-403, FR-601 | BR-001, BR-003, DEC-001, SM-001 | TBD (draft) |
| CAP-02 | Chọn ngôn ngữ giao diện | Chọn VN hoặc EN để toàn bộ chữ trên trang đổi theo và được nhớ lại | US003 | FR-002, FR-205, FR-404 | BR-002 | TBD (draft) |

## 3. Open Decisions

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Bản tiếng Anh của từng đoạn chữ trên trang (Figma chỉ có bản VN) — **Đã chốt 2026-11-06: dùng bản đề xuất** | Dùng bản đề xuất ở § 13: "Start your journey with SAA 2025." / "Log in to explore!" / "Copyright by Sun* © 2025" / "Sign-in failed. Please try again." | Sát nghĩa bản VN, giữ nguyên tên "ROOT FURTHER" và nhãn nút "LOGIN With Google" | no |
| D002 | Bố cục trên màn hình nhỏ (Figma chỉ có khung desktop) — **Đã chốt 2026-11-06: "theo spec" → chỉ desktop** | Chỉ làm bố cục desktop theo Figma, không thêm hành vi responsive | Spec không nêu responsive; tránh làm ngoài phạm vi | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Dịch vụ xác thực phải bật đăng nhập Google cho mọi tài khoản Google, khóa cấu hình lấy từ biến môi trường và không đưa vào kho mã.
- **FR-002** Mọi đoạn chữ trên trang Login có bản VN và EN trong một từ điển đơn giản, không dùng thư viện đa ngôn ngữ.

### Navigation (1xx)

- **FR-101** Người dùng mở `/login` thì thấy màn hình đăng nhập, ngôn ngữ mặc định là VN khi chưa chọn lần nào.

### Login (2xx)

- **FR-201** Header cố định đầu trang có logo Sun* Annual Awards 2025 ở bên trái, hiển thị tĩnh và không bấm được.
- **FR-202** Khu vực chính hiển thị hình hero trang trí, tiêu đề "ROOT FURTHER" và đoạn giới thiệu "Bắt đầu hành trình của bạn cùng SAA 2025." / "Đăng nhập để khám phá!".
- **FR-203** Có đúng một nút đăng nhập, "LOGIN With Google", với biểu tượng Google, nền vàng nhạt, chữ đậm.
- **FR-204** Chân trang hiển thị "Bản quyền thuộc về Sun* © 2025" căn giữa.
- **FR-205** Bộ chọn ngôn ngữ ở góc phải header hiện cờ và nhãn ngôn ngữ đang dùng, mở ra hai lựa chọn VN và EN.

### Interaction (4xx)

- **FR-401** Bấm "LOGIN With Google" thì nút chuyển sang trạng thái loading rồi người dùng được đưa tới trang đăng nhập của Google.
- **FR-402** Đăng nhập Google thành công thì người dùng được chuyển sang `/todo`.
- **FR-403** Đăng nhập thất bại hoặc người dùng hủy thì `/login` hiện "Đăng nhập không thành công. Vui lòng thử lại."
- **FR-404** Chọn ngôn ngữ thì toàn bộ chữ trên trang đổi ngay sang ngôn ngữ đó và lựa chọn được nhớ cho lần mở sau.

### Security (6xx)

- **FR-601** Phiên đăng nhập chỉ được thiết lập ở máy chủ sau khi Google xác thực xong; khóa bí mật không bao giờ lộ ra trình duyệt.

## 5. Business Rules

- Mọi tài khoản Google đều được phép đăng nhập, không giới hạn tên miền hay email (BR-001)
- Ngôn ngữ chỉ có VN hoặc EN; chưa chọn hoặc giá trị không hợp lệ thì dùng VN `[INFERRED]` (BR-002)
- Mọi nguyên nhân đăng nhập lỗi (thất bại, hủy, không khởi động được) đều hiện cùng một thông báo (BR-003)
- Đăng nhập thành công thì vào `/todo`; thất bại hoặc hủy thì ở lại `/login` kèm thông báo lỗi (DEC-001)
- Nút đăng nhập đi từ bình thường sang loading rồi sang lỗi (nếu có), bấm lại được sau lỗi (SM-001)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Login | TBD (draft) | Header (logo, bộ chọn ngôn ngữ), hình hero, "ROOT FURTHER", đoạn giới thiệu, nút "LOGIN With Google", footer; thông báo lỗi khi đăng nhập hỏng | Chọn ngôn ngữ VN/EN; bấm "LOGIN With Google" |

### User Journey

1. Người dùng mở màn hình Login và thấy trang bằng tiếng Việt (hoặc ngôn ngữ đã chọn lần trước).
2. Người dùng có thể mở bộ chọn ngôn ngữ và chọn VN hoặc EN — chữ trên trang đổi ngay.
3. Người dùng bấm "LOGIN With Google" — nút chuyển sang loading và trình duyệt chuyển tới trang đăng nhập của Google.
4. Đăng nhập thành công — người dùng được đưa tới trang `/todo` (màn hình khác).
5. Đăng nhập thất bại hoặc hủy — người dùng quay lại Login, thấy "Đăng nhập không thành công. Vui lòng thử lại." và bấm lại được.

## 7. User Stories

### US001_LoginWithGoogle — Đăng nhập bằng Google

**Actor:** Khách chưa đăng nhập
**Goal:** Đăng nhập vào SAA 2025 bằng tài khoản Google của mình.
**Business value:** Người dùng vào được ứng dụng mà không phải tạo và nhớ mật khẩu riêng.

**Acceptance Criteria:**
- [ ] Bấm "LOGIN With Google" thì nút hiện trạng thái loading và trình duyệt chuyển tới trang đăng nhập Google.
- [ ] Đăng nhập Google thành công thì người dùng được chuyển sang `/todo`.
- [ ] Tài khoản Google nào cũng đăng nhập được.

### US002_RetryAfterFailedLogin — Thấy lỗi và thử lại khi đăng nhập không thành công

**Actor:** Khách chưa đăng nhập
**Goal:** Biết đăng nhập chưa thành công và thử lại ngay trên trang.
**Business value:** Người dùng không bị kẹt hay phải tự đoán chuyện gì đã xảy ra.

**Acceptance Criteria:**
- [ ] Đăng nhập thất bại hoặc hủy ở Google thì `/login` hiện "Đăng nhập không thành công. Vui lòng thử lại."
- [ ] Sau khi thấy lỗi, nút "LOGIN With Google" bấm lại được.

### US003_SwitchLanguage — Đổi ngôn ngữ giao diện

**Actor:** Khách chưa đăng nhập
**Goal:** Đọc trang Login bằng tiếng Việt hoặc tiếng Anh tùy ý.
**Business value:** Người dùng ở các thị trường khác nhau hiểu nội dung trang ngay từ lần đầu.

**Acceptance Criteria:**
- [ ] Lần đầu mở trang, bộ chọn hiện VN và chữ trên trang là tiếng Việt.
- [ ] Chọn EN thì toàn bộ chữ trên trang (kể cả thông báo lỗi) đổi sang tiếng Anh.
- [ ] Mở lại trang sau đó vẫn giữ ngôn ngữ đã chọn.

## 8. Scenarios

### US001_LoginWithGoogle — Happy Path

**Given** khách đang ở `/login`, **When** bấm "LOGIN With Google" và hoàn tất đăng nhập ở Google, **Then** người dùng được chuyển sang `/todo`.

### US001_LoginWithGoogle — Error: không khởi động được luồng Google

**Given** khách đang ở `/login` nhưng dịch vụ xác thực không phản hồi, **When** bấm "LOGIN With Google", **Then** nút trở về bình thường và trang hiện "Đăng nhập không thành công. Vui lòng thử lại."

### US002_RetryAfterFailedLogin — Happy Path

**Given** lần đăng nhập trước đã thất bại và trang đang hiện thông báo lỗi, **When** người dùng bấm lại "LOGIN With Google" và đăng nhập thành công, **Then** người dùng được chuyển sang `/todo`.

### US002_RetryAfterFailedLogin — Error: hủy ở Google

**Given** khách đang ở trang đăng nhập của Google, **When** bấm hủy hoặc đóng, **Then** người dùng quay lại `/login` và thấy "Đăng nhập không thành công. Vui lòng thử lại."

### US003_SwitchLanguage — Happy Path

**Given** trang đang ở tiếng Việt, **When** người dùng mở bộ chọn và chọn EN, **Then** mọi chữ trên trang đổi sang tiếng Anh và bộ chọn hiện EN.

### US003_SwitchLanguage — Error: lựa chọn đã lưu không hợp lệ

**Given** ngôn ngữ đã lưu trước đó không phải VN hoặc EN, **When** người dùng mở `/login`, **Then** trang hiện bằng tiếng Việt như mặc định.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Người dùng hủy hoặc đóng cửa sổ đăng nhập Google | Quay lại `/login`, nút bấm lại được | "Đăng nhập không thành công. Vui lòng thử lại." |
| Bấm nút nhiều lần liên tiếp | Nút bị khóa khi đang loading, chỉ một lượt đăng nhập được bắt đầu | None — silent handling |
| Người dùng bấm Back từ trang Google | `/login` về trạng thái bình thường, không kẹt ở loading `[EXPECTED]` | None — silent handling |
| Dịch vụ xác thực không phản hồi | Nút về bình thường, hiện lỗi chung | "Đăng nhập không thành công. Vui lòng thử lại." |
| Ngôn ngữ đã lưu không hợp lệ | Dùng tiếng Việt | None — silent handling |
| Đăng nhập thành công nhưng `/todo` chưa được làm | Người dùng thấy trang không tìm thấy của ứng dụng (xem RISK-01) | Trang "không tìm thấy" mặc định của ứng dụng |
| Người đã đăng nhập mở lại `/login` | Vẫn thấy trang Login bình thường (spec không nêu chuyển hướng) | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-001** → Đăng nhập được bằng một tài khoản Google bất kỳ, không bị từ chối vì tên miền.
- **FR-002** → Không còn đoạn chữ nào trên trang giữ nguyên tiếng Việt khi đã chọn EN.
- **FR-101** → Mở `/login` lần đầu thấy tiếng Việt và bộ chọn hiện VN.
- **FR-201** → Bấm logo không có tác dụng gì.
- **FR-202** → Có hình hero, tiêu đề "ROOT FURTHER" và hai dòng giới thiệu đúng nội dung.
- **FR-203** → Trang chỉ có một nút đăng nhập, "LOGIN With Google".
- **FR-204** → Footer hiện "Bản quyền thuộc về Sun* © 2025".
- **FR-205** → Bộ chọn mở ra hai lựa chọn VN và EN.
- **FR-401** → Bấm nút thì nút hiện loading rồi trình duyệt sang trang Google.
- **FR-402** → Đăng nhập thành công kết thúc ở `/todo`.
- **FR-403** → Hủy hoặc thất bại thì `/login` hiện đúng thông báo lỗi.
- **FR-404** → Chọn EN, tải lại trang, vẫn là EN.
- **FR-601** → Trình duyệt không nhận được khóa bí mật nào trong quá trình đăng nhập.

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Feature chuyển người dùng sang `/todo` nhưng không tạo trang này (thuộc màn hình khác) | Cho tới khi màn hình `/todo` được làm, đăng nhập thành công dẫn tới trang không tìm thấy | confirmed |
| RISK-02 | risk | Mọi tài khoản Google đều đăng nhập được, không có phân quyền | Bất kỳ ai có tài khoản Google đều tạo được người dùng; kiểm soát truy cập, nếu cần, phải nằm ở màn hình sau đăng nhập | confirmed |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| Supabase Auth (chạy local) | external-service | Thực hiện luồng đăng nhập Google và lưu phiên | FR-001, FR-402 |
| Google OAuth (client id/secret do người dùng cấp) | external-service | Là nguồn xác thực duy nhất | FR-401, BR-001 |
| Màn hình `/todo` | feature | Đích sau đăng nhập thành công; không thuộc feature này | FR-402, RISK-01 |
| Biến môi trường cấu hình Google | config | Đưa client id/secret vào dịch vụ xác thực mà không commit | FR-001 |

## 13. Configuration

```text
DEFAULT_LANGUAGE = VN          # ngôn ngữ dùng khi người dùng chưa chọn hoặc lựa chọn không hợp lệ
SUPPORTED_LANGUAGES = VN, EN   # hai ngôn ngữ trong bộ chọn
LANGUAGE_STORE = cookie NEXT_LOCALE   # nơi nhớ lựa chọn của người dùng
POST_LOGIN_DESTINATION = /todo        # nơi người dùng đến sau khi đăng nhập thành công
LOGIN_ERROR_MESSAGE_VN = "Đăng nhập không thành công. Vui lòng thử lại."
LOGIN_ERROR_MESSAGE_EN = "Sign-in failed. Please try again."      # đề xuất, xem D001
INTRO_EN = "Start your journey with SAA 2025." / "Log in to explore!"   # đề xuất, xem D001
FOOTER_EN = "Copyright by Sun* © 2025"                            # đề xuất, xem D001
```
