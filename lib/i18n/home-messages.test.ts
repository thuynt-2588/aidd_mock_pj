import { describe, expect, it } from "vitest";

import { getHomeMessages } from "./home-messages";

// Recursively lists every leaf key path, e.g. "event.timeLabel".
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("home messages", () => {
  const vi = getHomeMessages("vi");
  const en = getHomeMessages("en");

  it("has the same keys (and array lengths) in vi and en", () => {
    expect(keyPaths(en)).toEqual(keyPaths(vi));
  });

  it("has no empty strings in either locale", () => {
    for (const messages of [vi, en]) {
      const strings = JSON.stringify(messages).match(/"(?:[^"\\]|\\.)*"/g) ?? [];
      expect(strings).not.toContain('""');
    }
  });

  it("lists the six award categories in Figma order with stable slugs", () => {
    const expected = ["top-talent", "top-project", "top-project-leader", "best-manager", "signature-2025-creator", "mvp"];
    expect(vi.awardsSection.items.map((a) => a.slug)).toEqual(expected);
    expect(en.awardsSection.items.map((a) => a.slug)).toEqual(expected);
  });

  it("keeps proper names identical across locales", () => {
    expect(en.awardsSection.items.map((a) => a.title)).toEqual(vi.awardsSection.items.map((a) => a.title));
    expect(en.kudos.title).toBe("Sun* Kudos");
    expect(en.cta).toEqual(vi.cta);
  });

  it("uses the Figma copy for the event block (Figma wins over the spec)", () => {
    expect(vi.event).toMatchObject({ timeValue: "26/12/2025", placeValue: "Âu Cơ Art Center" });
    expect(vi.countdown.comingSoon).toBe("Coming soon");
  });
});
