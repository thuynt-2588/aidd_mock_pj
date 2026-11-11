import { describe, expect, it } from "vitest";

import { isSiteOpen, PRELAUNCH_PATH, prelaunchRedirectTarget } from "./prelaunch-gate";

const OPEN = Date.parse("2026-12-01T09:00:00+07:00");
const BEFORE = OPEN - 1_000;

describe("isSiteOpen", () => {
  it("is false before the opening time and true from it on", () => {
    expect(isSiteOpen(OPEN, BEFORE)).toBe(false);
    expect(isSiteOpen(OPEN, OPEN)).toBe(true);
  });

  // No (valid) opening time configured → nothing to wait for, never lock the site.
  it("treats a missing opening time as open", () => {
    expect(isSiteOpen(null, BEFORE)).toBe(true);
  });
});

describe("prelaunchRedirectTarget", () => {
  it("always sends every other page to the countdown before the opening time", () => {
    for (const path of ["/", "/awards-information", "/login", "/sun-kudos"]) {
      expect(prelaunchRedirectTarget(path, { openMs: OPEN, nowMs: BEFORE })).toBe(PRELAUNCH_PATH);
    }
  });

  it("keeps the countdown page itself reachable before the opening time", () => {
    expect(prelaunchRedirectTarget(PRELAUNCH_PATH, { openMs: OPEN, nowMs: BEFORE })).toBeNull();
  });

  it("unlocks navigation and sends the countdown page home once the site is open", () => {
    expect(prelaunchRedirectTarget("/", { openMs: OPEN, nowMs: OPEN })).toBeNull();
    expect(prelaunchRedirectTarget(PRELAUNCH_PATH, { openMs: OPEN, nowMs: OPEN })).toBe("/");
  });

  it("never locks when no opening time is configured", () => {
    expect(prelaunchRedirectTarget("/", { openMs: null, nowMs: BEFORE })).toBeNull();
    expect(prelaunchRedirectTarget(PRELAUNCH_PATH, { openMs: null, nowMs: BEFORE })).toBe("/");
  });
});
