---
status: draft
authored_by: takumi
created: 2026-11-06
lang: vi
---

# SCR-login — Screen Spec

**Screen**: SCR-login: Login (SCR### được cấp khi promote)
**Feature**: login-google-oauth (F### được cấp khi promote)
**Type**: atomic
**Route**: /login
**Generated**: 2026-11-06

## 1. Overview

**Purpose:** Khách chưa đăng nhập mở màn hình này để đăng nhập vào SAA 2025 bằng tài khoản Google, và để chọn đọc trang bằng tiếng Việt hoặc tiếng Anh.
**Actors:** Khách chưa đăng nhập
**Entry Conditions:** Mở trực tiếp địa chỉ `/login`, hoặc quay lại sau khi đăng nhập Google thất bại/hủy. Không có điều kiện nào khác (spec không chặn người đã đăng nhập).
**Exit Conditions:** Đăng nhập Google thành công và người dùng được chuyển sang `/todo`; hoặc người dùng rời trang.

## 2. Screen Layout

### Layout Sketch

Header cố định ở đầu trang: logo bên trái, bộ chọn ngôn ngữ bên phải. Khu vực chính chiếm toàn bộ khoảng giữa header và footer: hình hero (sóng màu trên nền tối) phủ nền bên phải và một phần phía trên; khối giới thiệu và nút đăng nhập nằm bên trái. Footer ở cuối trang, chữ bản quyền căn giữa trên nền tối. Bố cục theo khung desktop của Figma (662:14387); chưa có quy định responsive.

```
┌───────────────────────────────────────────────┐
│ R1: Header (fixed-top)                        │
│ [Logo]                              [🇻🇳 VN ▾] │
├───────────────────────────────────────────────┤
│ R2: Main login section (static)               │
│ ┌──────────────────┐  ░░ R3: Hero visual ░░░░ │
│ │ R4: Intro block  │  ░░░░░░░░░░░░░░░░░░░░░░ │
│ │ ROOT FURTHER     │  ░░░░░░░░░░░░░░░░░░░░░░ │
│ │ intro text       │  ░░░░░░░░░░░░░░░░░░░░░░ │
│ │ [G LOGIN With    │  ░░░░░░░░░░░░░░░░░░░░░░ │
│ │    Google]       │  ░░░░░░░░░░░░░░░░░░░░░░ │
│ └──────────────────┘                          │
├───────────────────────────────────────────────┤
│ R5: Footer (static)  Bản quyền thuộc về Sun*  │
└───────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Header | fixed-top | no | TBD (draft) |
| R2 | Main login section | static | no | TBD (draft) |
| R3 | Hero visual | static | no | TBD (draft) |
| R4 | Intro block | static | no | TBD (draft) |
| R5 | Footer | static | no | TBD (draft) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Logo Sun* Annual Awards 2025 | image | — | Hiển thị | Always | — | static | raw | — | MoMorph 1.1 |
| E02 | Bộ chọn ngôn ngữ (cờ + "VN" + mũi tên) | select | no | VN | Always | Mở menu ngôn ngữ | TBD (draft) | raw | — | MoMorph 1.2 |
| E03 | Menu ngôn ngữ (VN, EN) | list | — | Đóng | Conditional | Chọn ngôn ngữ | static | raw | — | MoMorph 1.2 |
| E04 | Hình hero (dải sóng vàng, cam, xanh lá, xanh dương, tím trên nền tối) | image | — | Hiển thị | Always | — | static | raw | — | MoMorph 2.1 |
| E05 | Tiêu đề "ROOT FURTHER" | display field | — | Hiển thị | Always | — | static | raw | — | MoMorph 2.2 |
| E06 | Đoạn giới thiệu: "Bắt đầu hành trình của bạn cùng SAA 2025." / "Đăng nhập để khám phá!" | display field | — | Hiển thị | Always | — | static | raw | — | MoMorph 2.2 |
| E07 | LOGIN With Google | button | — | Enabled | Always | Bắt đầu đăng nhập Google | static | raw | — | MoMorph 2.2.1 |
| E08 | Thông báo lỗi "Đăng nhập không thành công. Vui lòng thử lại." | message | — | Ẩn | Conditional | — | computed | raw | hidden | MoMorph 2.2.1 |
| E09 | Bản quyền "Bản quyền thuộc về Sun* © 2025" | display field | — | Hiển thị | Always | — | static | raw | — | MoMorph 3 |

Mọi chữ (E02, E03, E05, E06, E07, E08, E09) có bản EN khi người dùng chọn EN — bản EN là đề xuất, xem Open Decision D001 trong `functional-spec.md`. Nhãn "VN"/"EN", tên "ROOT FURTHER" và nhãn nút "LOGIN With Google" giữ nguyên ở cả hai ngôn ngữ.

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation`.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Mở menu ngôn ngữ | E02 | click | — | Menu E03 hiện ra với VN và EN | TBD (draft) |
| Chọn ngôn ngữ | E03 | click một mục | — | Menu đóng, E02 hiện ngôn ngữ mới, mọi chữ trên trang đổi sang ngôn ngữ đó, lựa chọn được nhớ | TBD (draft) |
| Bắt đầu đăng nhập Google | E07 | click | E07 đang bình thường (không loading) | E07 sang trạng thái loading; E08 (nếu đang hiện) ẩn đi | TBD (draft) |

### Happy Path

1. Người dùng mở trang; thấy R1 đến R5 bằng tiếng Việt (hoặc ngôn ngữ đã chọn trước đó).
2. Người dùng bấm "LOGIN With Google" ở R4; nút chuyển sang loading.
3. Trình duyệt rời trang để sang bước đăng nhập Google (hết phạm vi màn hình này).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 2 | Không khởi động được đăng nhập (mạng, dịch vụ xác thực lỗi) | E07 về bình thường, E08 hiện | TBD (draft) |
| Bước 1 | Trang mở sau khi đăng nhập Google thất bại hoặc hủy | E08 hiện sẵn, E07 bấm lại được | TBD (draft) |
| Bước 3 | Người dùng bấm Back từ trang Google | Trang về trạng thái bình thường, E07 bấm lại được `[EXPECTED]` | TBD (draft) |

### Interaction Notes

- **Bấm logo không có tác dụng — spec ghi "chưa rõ có điều hướng" nên hiển thị tĩnh** — source: TBD (draft)
- **Đổi ngôn ngữ không tải lại luồng đăng nhập hay làm mất thông báo lỗi đang hiện; thông báo lỗi đổi theo ngôn ngữ mới** — source: TBD (draft)

## 5. UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| default | Mở trang | E01 đến E07, E09 hiện; E03, E08 ẩn; E02 hiện VN (hoặc ngôn ngữ đã chọn) | Chọn ngôn ngữ, bấm E07 | TBD (draft) |
| menu-open | Bấm E02 | E03 hiện danh sách VN, EN | Chọn một mục hoặc đóng menu | TBD (draft) |
| loading | Bấm E07 (đang chờ chuyển sang Google) | E07 vô hiệu hóa, hiện chỉ báo đang xử lý | none | TBD (draft) |
| error | Đăng nhập thất bại/hủy hoặc không khởi động được | E08 hiện "Đăng nhập không thành công. Vui lòng thử lại."; E07 bình thường | Bấm lại E07 | TBD (draft) |
| success | Google xác thực thành công | Rời trang, chuyển sang `/todo` (không hiện gì thêm trên trang này) | none | TBD (draft) |

Màn hình không có vùng hiển thị dữ liệu động nên không có trạng thái empty; thao tác duy nhất là E07 nên loading cũng là trạng thái đang gửi (saving).

## 6. Validation & Feedback

| Element | Rule | Feedback | Trigger |
|---------|------|----------|---------|
| E07 | Đăng nhập Google phải thành công; thất bại, hủy hoặc không khởi động được đều tính là lỗi | "Đăng nhập không thành công. Vui lòng thử lại." (EN đề xuất: "Sign-in failed. Please try again.") hiện ở E08 | server response |
| E02 | Chỉ nhận VN hoặc EN | Không có thông báo; giá trị không hợp lệ đã lưu thì dùng VN | change |

## 7. Conditional UI

| Condition | Type | Element(s) | Visible when | Hidden when | Notes |
|-----------|------|------------|--------------|-------------|-------|
| Thông báo lỗi hiện khi lần đăng nhập gần nhất không thành công | auth | E08 | Lần đăng nhập gần nhất thất bại, hủy hoặc không khởi động được | Mở trang bình thường, hoặc khi bắt đầu lượt đăng nhập mới | Chỉ có một thông báo cho mọi nguyên nhân |
| Menu ngôn ngữ hiện khi người dùng mở bộ chọn | configuration | E03 | Sau khi bấm E02 | Sau khi chọn một mục hoặc đóng menu | — |

## 8. Navigation

> **D3 — the DRY statement that MUST appear verbatim in the template and the contract:**
>
> `## 8. Navigation` is the **per-screen projection** of `screen-flow.md § Screen Access Paths`.
> It is not a second source of truth. Every row here MUST be derivable from a path in
> `screen-flow.md`; every path in `screen-flow.md` touching this SCR### MUST appear here.
> Two-way consistency is a reviewer rule (`screen.nav_flow_skew`), not a Python check.
> `## 4. User Actions § Happy Path` narrative keeps its v27 scope rule unchanged: **prose still
> must not narrate cross-screen navigation**; only the § Exits *table* may name destinations.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| external | Mở trực tiếp địa chỉ `/login` | — | TBD (draft) |
| external (Google qua bước chuyển tiếp) | Đăng nhập thất bại hoặc hủy | Quay lại kèm thông báo lỗi | TBD (draft) |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Bắt đầu đăng nhập Google | E07 | — | external (trang đăng nhập Google) | redirect | TBD (draft) |
| Đăng nhập thành công | E07 | Google xác thực thành công | TBD (draft) — trang `/todo`, thuộc màn hình khác | redirect | TBD (draft) |
| Đăng nhập thất bại / hủy | E07 | Google thất bại hoặc hủy | (stays on screen) | redirect rồi hiện E08 | TBD (draft) |
| Chọn ngôn ngữ | E03 | — | (stays on screen) | chữ trên trang đổi | TBD (draft) |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | Logo có văn bản thay thế "Sun* Annual Awards 2025"; E02 khai báo menu đang mở/đóng; E07 báo bận khi loading; hình hero là trang trí nên ẩn khỏi trình đọc màn hình |
| Keyboard navigation | [EXPECTED] | Thứ tự Tab: bộ chọn ngôn ngữ, nút đăng nhập; Enter/Space kích hoạt; Esc đóng menu ngôn ngữ; mũi tên chọn mục |
| Focus management | [EXPECTED] | Đóng menu thì trả focus về E02; không có bẫy focus |
| Screen reader compatibility | [EXPECTED] | Có vùng header, main, footer; thuộc tính ngôn ngữ của trang đổi theo VN/EN |
| Error announcement | [EXPECTED] | E08 được đọc ngay khi xuất hiện (vùng thông báo dạng alert) |

## 10. Responsive Behavior

N/A — no responsive behavior found in source.

Spec và Figma (khung 662:14387) chỉ định bố cục desktop; để mở ở Open Decision D002 trong `functional-spec.md`.
