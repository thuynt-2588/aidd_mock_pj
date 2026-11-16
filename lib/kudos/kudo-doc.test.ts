import { describe, expect, it } from "vitest";

import { kudoDocMentions, kudoDocToText, normalizeKudoDoc, safeHref } from "./kudo-doc";

const ID = "5a000000-0000-4000-8000-000000000004";

describe("normalizeKudoDoc", () => {
  it("keeps paragraphs, quotes, numbered lists, marks, links and mentions", () => {
    const doc = {
      version: 1,
      blocks: [
        { type: "paragraph", children: [{ type: "text", text: "Hi ", bold: true, italic: true, strike: true }, { type: "mention", id: ID, name: " Thúy " }] },
        { type: "quote", children: [{ type: "text", text: "Sun*", href: "https://sun-asterisk.vn" }] },
        { type: "ordered-list", items: [[{ type: "text", text: "one" }], [{ type: "text", text: "two" }]] },
      ],
    };
    expect(normalizeKudoDoc(doc)).toEqual({
      version: 1,
      blocks: [
        { type: "paragraph", children: [{ type: "text", text: "Hi ", bold: true, italic: true, strike: true }, { type: "mention", id: ID, name: "Thúy" }] },
        { type: "quote", children: [{ type: "text", text: "Sun*", href: "https://sun-asterisk.vn" }] },
        { type: "ordered-list", items: [[{ type: "text", text: "one" }], [{ type: "text", text: "two" }]] },
      ],
    });
  });

  it("drops unknown keys, non-true marks and empty text", () => {
    const doc = { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "a", bold: "yes", onclick: "x", style: "x" }, { type: "text", text: "" }] }] };
    expect(normalizeKudoDoc(doc)).toEqual({ version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "a" }] }] });
  });

  it.each([
    ["not an object", "x"],
    ["wrong version", { version: 2, blocks: [] }],
    ["unknown block", { version: 1, blocks: [{ type: "html", children: [] }] }],
    ["unknown inline", { version: 1, blocks: [{ type: "paragraph", children: [{ type: "image", src: "x" }] }] }],
    ["javascript: link", { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "x", href: "javascript:alert(1)" }] }] }],
    ["data: link", { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "x", href: "data:text/html,hi" }] }] }],
    ["bad mention id", { version: 1, blocks: [{ type: "paragraph", children: [{ type: "mention", id: "1", name: "x" }] }] }],
    ["too many blocks", { version: 1, blocks: Array.from({ length: 201 }, () => ({ type: "paragraph", children: [] })) }],
  ])("rejects %s", (_, input) => {
    expect(normalizeKudoDoc(input)).toBeNull();
  });
});

describe("safeHref", () => {
  it("accepts http(s) only, 5–2048 chars", () => {
    expect(safeHref(" https://a.vn ")).toBe("https://a.vn");
    expect(safeHref("http://a.vn/x?y=1")).toBe("http://a.vn/x?y=1");
    expect(safeHref("ftp://a.vn")).toBeNull();
    expect(safeHref("a.vn")).toBeNull();
    expect(safeHref(`https://a.vn/${"x".repeat(2048)}`)).toBeNull();
  });
});

describe("kudoDocToText / kudoDocMentions", () => {
  const doc = normalizeKudoDoc({
    version: 1,
    blocks: [
      { type: "paragraph", children: [{ type: "text", text: "Cảm ơn " }, { type: "mention", id: ID, name: "Thúy" }, { type: "text", text: "!  " }] },
      { type: "paragraph", children: [] },
      { type: "paragraph", children: [] },
      { type: "paragraph", children: [] },
      { type: "ordered-list", items: [[{ type: "text", text: "a" }], [{ type: "text", text: "b" }]] },
      { type: "quote", children: [{ type: "text", text: "q" }] },
    ],
  })!;

  it("writes one line per block / item, mentions as @name, at most one blank line", () => {
    expect(kudoDocToText(doc)).toBe("Cảm ơn @Thúy!\n\n1. a\n2. b\nq");
  });

  it("is empty for a document with only blank paragraphs", () => {
    expect(kudoDocToText({ version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "  " }] }] })).toBe("");
  });

  it("lists mentioned ids once", () => {
    expect(kudoDocMentions(doc)).toEqual([ID]);
  });
});
