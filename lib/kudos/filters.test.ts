import { describe, expect, it } from "vitest";

import { kudosFilterHref, parseKudosFilters } from "./filters";

describe("parseKudosFilters", () => {
  it("reads hashtag and department from the query", () => {
    expect(parseKudosFilters({ hashtag: "#Dedicated", department: "CEVC10" })).toEqual({
      hashtag: "#Dedicated",
      department: "CEVC10",
    });
  });

  it("ignores missing, empty, repeated or over-long values", () => {
    expect(parseKudosFilters({})).toEqual({ hashtag: null, department: null });
    expect(parseKudosFilters({ hashtag: "", department: ["A", "B"] })).toEqual({ hashtag: null, department: null });
    expect(parseKudosFilters({ hashtag: "#" + "x".repeat(100) })).toEqual({ hashtag: null, department: null });
  });
});

describe("kudosFilterHref", () => {
  it("builds /sun-kudos with the active filters, encoded", () => {
    expect(kudosFilterHref({ hashtag: "#Dedicated", department: null })).toBe("/sun-kudos?hashtag=%23Dedicated");
    expect(kudosFilterHref({ hashtag: "#A", department: "CEVC1" })).toBe("/sun-kudos?hashtag=%23A&department=CEVC1");
  });

  it("returns the bare path when nothing is filtered", () => {
    expect(kudosFilterHref({ hashtag: null, department: null })).toBe("/sun-kudos");
  });
});
