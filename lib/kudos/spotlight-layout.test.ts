import { describe, expect, it } from "vitest";

import { layoutSpotlight } from "./spotlight-layout";

const people = [
  { profileId: "a", name: "Nguyễn Văn Quy", kudosCount: 24 },
  { profileId: "b", name: "Nguyễn Hoàng Linh", kudosCount: 14 },
  { profileId: "c", name: "Lê Kiều Trang", kudosCount: 4 },
  { profileId: "d", name: "Đỗ Hoàng Hiệp", kudosCount: 3 },
];

describe("layoutSpotlight", () => {
  const nodes = layoutSpotlight(people, { width: 1000, height: 500 });

  it("places every person inside the board", () => {
    expect(nodes).toHaveLength(4);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(1000);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(500);
    }
  });

  it("draws people with more kudos bigger (Figma 6.7px → 11.3px)", () => {
    const size = (id: string) => nodes.find((n) => n.profileId === id)!.fontSize;
    expect(size("a")).toBeGreaterThan(size("b"));
    expect(size("b")).toBeGreaterThan(size("c"));
    expect(size("d")).toBeGreaterThanOrEqual(6.5);
    expect(size("a")).toBeLessThanOrEqual(12);
  });

  it("is deterministic (same input → same layout, no hydration mismatch)", () => {
    expect(layoutSpotlight(people, { width: 1000, height: 500 })).toEqual(nodes);
  });

  it("handles an empty board", () => {
    expect(layoutSpotlight([], { width: 1000, height: 500 })).toEqual([]);
  });
});
