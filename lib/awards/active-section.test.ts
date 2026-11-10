import { describe, expect, it } from "vitest";

import { findActiveSlug, slugFromHash } from "./active-section";

const SLUGS = ["top-talent", "top-project", "mvp"] as const;
const at = (...tops: number[]) => SLUGS.map((slug, i) => ({ slug, top: tops[i] }));

describe("findActiveSlug", () => {
  it("picks the first section while nothing has reached the offset yet", () => {
    expect(findActiveSlug(at(400, 1200, 2000), 120)).toBe("top-talent");
  });

  it("picks the last section whose top has scrolled past the offset", () => {
    expect(findActiveSlug(at(-900, 100, 900), 120)).toBe("top-project");
  });

  it("counts a section whose top sits exactly on the offset", () => {
    expect(findActiveSlug(at(-900, 120, 900), 120)).toBe("top-project");
  });

  it("keeps the last section once every section is above the offset", () => {
    expect(findActiveSlug(at(-3000, -2000, -100), 120)).toBe("mvp");
  });

  it("returns null when there are no sections", () => {
    expect(findActiveSlug([], 120)).toBeNull();
  });
});

describe("slugFromHash", () => {
  it("returns the slug of a known #hash", () => {
    expect(slugFromHash("#mvp", SLUGS)).toBe("mvp");
  });

  it.each(["", "#", "#unknown", "mvp"])("returns null for %j", (hash) => {
    expect(slugFromHash(hash, SLUGS)).toBeNull();
  });

  it("decodes an encoded hash", () => {
    expect(slugFromHash("#top%2Dproject", SLUGS)).toBe("top-project");
  });
});
