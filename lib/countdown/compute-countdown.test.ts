import { describe, expect, it } from "vitest";

import { computeCountdown, msUntilNextTick, padTwoDigits, parseEventStart } from "./compute-countdown";

const MINUTE = 60_000;
const START = Date.parse("2026-12-26T18:30:00+07:00");

describe("parseEventStart", () => {
  it("parses an ISO-8601 datetime with offset", () => {
    expect(parseEventStart("2026-12-26T18:30:00+07:00")).toBe(START);
  });

  it.each([undefined, "", "not-a-date"])("returns null for %j", (value) => {
    expect(parseEventStart(value)).toBeNull();
  });
});

describe("computeCountdown", () => {
  it("splits the remaining time into whole days, hours and minutes", () => {
    const remaining = ((2 * 24 + 3) * 60 + 4) * MINUTE + 30_000; // 2d 3h 4m 30s
    expect(computeCountdown(START, START - remaining)).toEqual({ days: 2, hours: 3, minutes: 4, upcoming: true });
  });

  it("counts down by one minute after a minute passes", () => {
    const remaining = ((2 * 24 + 3) * 60 + 4) * MINUTE + 30_000;
    expect(computeCountdown(START, START - remaining + MINUTE).minutes).toBe(3);
  });

  // Spec B1.3: "Khi về 0: ẩn 'Coming soon' và giữ nguyên trạng thái 00".
  // The display is minute-precision, so the last partial minute already reads 00.
  it("hides Coming soon once the display reaches 00:00:00 (final partial minute)", () => {
    expect(computeCountdown(START, START - 30_000)).toEqual({ days: 0, hours: 0, minutes: 0, upcoming: false });
  });

  it.each([
    ["exactly at the start", START],
    ["after the start", START + MINUTE],
  ])("returns zeros and upcoming false %s", (_label, now) => {
    expect(computeCountdown(START, now)).toEqual({ days: 0, hours: 0, minutes: 0, upcoming: false });
  });

  it("returns zeros when no start is configured", () => {
    expect(computeCountdown(null, Date.now())).toEqual({ days: 0, hours: 0, minutes: 0, upcoming: false });
  });

  it("does not cap days at 99", () => {
    expect(computeCountdown(START, START - 120 * 24 * 60 * MINUTE).days).toBe(120);
  });
});

describe("padTwoDigits", () => {
  it.each([
    [0, "00"],
    [4, "04"],
    [23, "23"],
    [120, "120"],
  ])("pads %i to %s", (value, expected) => {
    expect(padTwoDigits(value)).toBe(expected);
  });
});

describe("msUntilNextTick", () => {
  // The next tick must land just past the boundary: exactly on it the floored
  // minute has not changed yet, so the display would lag a whole minute.
  it("fires just after the remaining time drops below the next whole minute", () => {
    const now = START - (5 * MINUTE + 12_000);
    const wait = msUntilNextTick(START, now);
    expect(wait).toBe(12_001);
    expect(computeCountdown(START, now + wait).minutes).toBe(4);
  });

  it("fires almost immediately when exactly on a minute boundary", () => {
    const now = START - 5 * MINUTE;
    expect(msUntilNextTick(START, now)).toBe(1);
    expect(computeCountdown(START, now + 1).minutes).toBe(4);
  });
});
