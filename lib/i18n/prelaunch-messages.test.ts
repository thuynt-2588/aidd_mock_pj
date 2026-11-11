import { describe, expect, it } from "vitest";

import { getPrelaunchMessages } from "./prelaunch-messages";

describe("prelaunch messages", () => {
  it("uses the Figma / spec title in Vietnamese and a translation in English", () => {
    expect(getPrelaunchMessages("vi").title).toBe("Sự kiện sẽ bắt đầu sau");
    expect(getPrelaunchMessages("en").title).toBe("Event starts in");
  });

  it("keeps the uppercase unit labels from Figma", () => {
    for (const locale of ["vi", "en"] as const) {
      expect(getPrelaunchMessages(locale).units).toEqual({ days: "DAYS", hours: "HOURS", minutes: "MINUTES" });
    }
  });
});
