# Clarifications — Dropdown-ngôn ngữ (hUyaaugye2)

Defaults taken by the agent (change on request).

| # | Topic | Decision |
|---|-------|----------|
| 1 | Scope | Component screen: update the existing `LanguageSelector` used on every page header; no new route. |
| 2 | Flags | User exported both flags from Figma as 20x15 SVGs: `public/login/flag-en.svg` (replaces the agent-drawn `flag-gb.svg`, now deleted) and an updated `flag-vn.svg`. Rendered 20x15 centred in a 24x24 slot, like the Figma "IC" frame. |
| 3 | Selected state | The current locale's row keeps the Figma highlight (rgba(255,234,158,0.2), radius 2); other rows get the existing hover (white 10%). Clicking the selected row just closes the list. |
| 4 | Trigger | Unchanged (108x56, already matched the login Figma); now also shows the UK flag when EN is active. |
| 5 | Figma frame bg | The 215x304 grey (#696969) frame is only the Figma canvas behind the component — not rendered. |
