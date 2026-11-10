import { describe, expect, it } from "vitest";

import { getAwardsMessages } from "./awards-messages";
import { getHomeMessages } from "./home-messages";

describe("getAwardsMessages", () => {
  it("lists the six awards in the same order and slugs as the homepage cards", () => {
    const homeSlugs = getHomeMessages("vi").awardsSection.items.map((a) => a.slug);
    for (const locale of ["vi", "en"] as const) {
      expect(getAwardsMessages(locale).awards.map((a) => a.slug)).toEqual(homeSlugs);
    }
  });

  it("keeps award titles identical across languages (proper names)", () => {
    const vi = getAwardsMessages("vi").awards.map((a) => a.title);
    expect(getAwardsMessages("en").awards.map((a) => a.title)).toEqual(vi);
  });

  it("gives every award at least one prize, and the same number of prizes in both languages", () => {
    const en = getAwardsMessages("en").awards;
    getAwardsMessages("vi").awards.forEach((award, i) => {
      expect(award.prizes.length).toBeGreaterThan(0);
      expect(en[i].prizes).toHaveLength(award.prizes.length);
      expect(en[i].quantity).toBe(award.quantity);
    });
  });

  it("uses the Figma Vietnamese headings", () => {
    const vi = getAwardsMessages("vi");
    expect(vi.title).toBe("Hệ thống giải thưởng SAA 2025");
    expect(vi.quantityLabel).toBe("Số lượng giải thưởng:");
    expect(vi.prizeLabel).toBe("Giá trị giải thưởng:");
  });
});
