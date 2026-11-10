import { describe, expect, it } from "vitest";
import { LINE_SEPARATOR, splitDescription } from "./description-lines";

describe("splitDescription", () => {
  it("keeps a plain text as one paragraph with one line", () => {
    expect(splitDescription("Một đoạn.")).toEqual([["Một đoạn."]]);
  });

  it("splits paragraphs on \\n and keeps a blank paragraph for an empty line", () => {
    expect(splitDescription("A.\n\nB.")).toEqual([["A."], [], ["B."]]);
  });

  it("splits Figma line separators into separate lines of the same paragraph", () => {
    expect(splitDescription(`A.${LINE_SEPARATOR}B.\n\nC.${LINE_SEPARATOR}D.`)).toEqual([["A.", "B."], [], ["C.", "D."]]);
  });
});
