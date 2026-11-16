import { describe, expect, it } from "vitest";

import { fillSpecialDayRange, formatHeartCount, formatKudoTime, formatTickerTime, heroBadge, truncateHashtags } from "./format";

describe("formatKudoTime (C.3.4: HH:mm - MM/DD/YYYY, Asia/Ho_Chi_Minh)", () => {
  it("formats in Vietnam time regardless of the input offset", () => {
    expect(formatKudoTime("2025-10-30T03:00:00Z")).toBe("10:00 - 10/30/2025");
    expect(formatKudoTime("2025-01-05T17:05:00Z")).toBe("00:05 - 01/06/2025");
  });
});

describe("formatTickerTime (Spotlight feed: 08:30PM)", () => {
  it("uses 12-hour time with AM/PM and no space", () => {
    expect(formatTickerTime("2025-11-10T13:30:00Z")).toBe("08:30PM");
    expect(formatTickerTime("2025-11-10T02:05:00Z")).toBe("09:05AM");
  });
});

describe("heroBadge (hover text: number of different Sunners who sent you kudos)", () => {
  it.each([
    [0, null],
    [1, "New Hero"],
    [4, "New Hero"],
    [5, "Rising Hero"],
    [9, "Rising Hero"],
    [10, "Super Hero"],
    [20, "Super Hero"],
    [21, "Legend Hero"],
    [300, "Legend Hero"],
  ])("%i senders → %s", (senders, badge) => {
    expect(heroBadge(senders)).toBe(badge);
  });
});

describe("fillSpecialDayRange (campaign hover: whole Vietnam day, DD/MM)", () => {
  it("fills {from} / {to} with 00:00 and 23:59 of the special day", () => {
    expect(fillSpecialDayRange("Từ {from} đến {to}.", "2026-12-05", "ngày")).toBe("Từ 00:00 ngày 05/12 đến 23:59 ngày 05/12.");
    expect(fillSpecialDayRange("From {from} to {to}.", "2026-01-31", "on")).toBe("From 00:00 on 31/01 to 23:59 on 31/01.");
  });
});

describe("formatHeartCount", () => {
  it("groups thousands with a dot like Figma (1.000)", () => {
    expect(formatHeartCount(0)).toBe("0");
    expect(formatHeartCount(10)).toBe("10");
    expect(formatHeartCount(1000)).toBe("1.000");
    expect(formatHeartCount(1234567)).toBe("1.234.567");
  });
});

describe("truncateHashtags (max 5 on one line, then …)", () => {
  it("keeps up to 5 tags", () => {
    expect(truncateHashtags(["#a", "#b"])).toEqual({ shown: ["#a", "#b"], more: false });
  });

  it("cuts after 5 and flags the overflow", () => {
    expect(truncateHashtags(["#1", "#2", "#3", "#4", "#5", "#6"])).toEqual({
      shown: ["#1", "#2", "#3", "#4", "#5"],
      more: true,
    });
  });
});
