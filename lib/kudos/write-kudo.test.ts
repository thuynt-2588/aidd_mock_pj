import { describe, expect, it } from "vitest";

import { imageExtension, isDraftComplete, validateKudoDraft, validateLink } from "./write-kudo";

const ME = "5a000000-0000-4000-8000-000000000001";
const THUY = "5a000000-0000-4000-8000-000000000004";
const PREFIX = `http://127.0.0.1:54321/storage/v1/object/public/kudo-images/${ME}/`;
const IMG = `${PREFIX}11111111-1111-4111-8111-111111111111.png`;
const ctx = { senderId: ME, imageUrlPrefix: PREFIX, knownHashtags: ["#Teamwork", "#Creative", "#A", "#B", "#C", "#D"] };
const doc = { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: " Cảm ơn! ", bold: true }] }] };
const valid = { receiverId: THUY, title: "  Người truyền động lực ", doc, hashtags: ["#Teamwork", "#Teamwork"], imageUrls: [IMG], anonymous: false, anonymousName: "x" };

describe("validateKudoDraft", () => {
  it("returns the cleaned draft", () => {
    const r = validateKudoDraft(valid, ctx);
    expect(r).toEqual({
      ok: true,
      value: {
        receiverId: THUY,
        title: "Người truyền động lực",
        content: "Cảm ơn!",
        doc: { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: " Cảm ơn! ", bold: true }] }] },
        hashtags: ["#Teamwork"],
        imageUrls: [IMG],
        anonymous: false,
        anonymousName: null,
      },
    });
  });

  it("keeps the alias only for an anonymous kudos; the alias is required then", () => {
    const a = validateKudoDraft({ ...valid, anonymous: true, anonymousName: " Bí ẩn " }, ctx);
    expect(a.ok && a.value.anonymousName).toBe("Bí ẩn");
    expect(validateKudoDraft({ ...valid, anonymous: true, anonymousName: "  " }, ctx)).toEqual({ ok: false, errors: { anonymousName: "required" } });
    expect(validateKudoDraft({ ...valid, anonymous: true, anonymousName: "x".repeat(51) }, ctx)).toEqual({ ok: false, errors: { anonymousName: "tooLong" } });
  });

  it("reports every missing required field", () => {
    const empty = { version: 1, blocks: [{ type: "paragraph", children: [] }] };
    expect(validateKudoDraft({ receiverId: null, title: " ", doc: empty, hashtags: [], imageUrls: [] }, ctx)).toEqual({
      ok: false,
      errors: { receiver: "required", title: "required", content: "required", hashtags: "required" },
    });
  });

  it.each([
    ["yourself as receiver", { receiverId: ME }, { receiver: "invalid" }],
    ["a non-uuid receiver", { receiverId: "abc" }, { receiver: "invalid" }],
    ["a title over 100", { title: "x".repeat(101) }, { title: "tooLong" }],
    ["content over 1000", { doc: { version: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "x".repeat(1001) }] }] } }, { content: "tooLong" }],
    ["an HTML block", { doc: { version: 1, blocks: [{ type: "html", html: "<b>x</b>" }] } }, { content: "invalid" }],
    ["6 hashtags", { hashtags: ["#Teamwork", "#Creative", "#A", "#B", "#C", "#D"] }, { hashtags: "tooMany" }],
    ["an unknown hashtag", { hashtags: ["#Nope"] }, { hashtags: "invalid" }],
    ["6 images", { imageUrls: Array(6).fill(IMG) }, { images: "tooMany" }],
    ["someone else's image", { imageUrls: [IMG.replace(ME, THUY)] }, { images: "invalid" }],
    ["a path-traversal image", { imageUrls: [`${PREFIX}../x.png`] }, { images: "invalid" }],
  ])("rejects %s", (_, patch, errors) => {
    expect(validateKudoDraft({ ...valid, ...patch }, ctx)).toEqual({ ok: false, errors });
  });
});

describe("isDraftComplete (H.2)", () => {
  const full = { receiverId: THUY, title: "t", contentText: "c", hashtags: ["#Teamwork"] };
  it("needs recipient, title, content and a hashtag", () => {
    expect(isDraftComplete(full)).toBe(true);
    expect(isDraftComplete({ ...full, receiverId: null })).toBe(false);
    expect(isDraftComplete({ ...full, title: "  " })).toBe(false);
    expect(isDraftComplete({ ...full, contentText: "\n" })).toBe(false);
    expect(isDraftComplete({ ...full, hashtags: [] })).toBe(false);
    expect(isDraftComplete({ ...full, anonymous: true, anonymousName: " " })).toBe(false);
    expect(isDraftComplete({ ...full, anonymous: true, anonymousName: "Doraemon" })).toBe(true);
    expect(isDraftComplete({ ...full, anonymous: false, anonymousName: "" })).toBe(true);
  });
});

describe("imageExtension (F)", () => {
  it("accepts png / jpeg / webp / gif up to 5 MB", () => {
    expect(imageExtension({ type: "image/png", size: 10 })).toBe("png");
    expect(imageExtension({ type: "image/jpeg", size: 5 * 1024 * 1024 })).toBe("jpg");
    expect(imageExtension({ type: "image/svg+xml", size: 10 })).toBeNull();
    expect(imageExtension({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toBeNull();
    expect(imageExtension({ type: "image/png", size: 0 })).toBeNull();
  });
});

describe("validateLink (Thêm đường dẫn)", () => {
  it("needs text 1–100 and an http(s) URL", () => {
    expect(validateLink("Sun*", "https://sun-asterisk.vn")).toEqual({});
    expect(validateLink(" ", "")).toEqual({ text: "required", url: "required" });
    expect(validateLink("x".repeat(101), "javascript:alert(1)")).toEqual({ text: "tooLong", url: "invalid" });
  });
});
