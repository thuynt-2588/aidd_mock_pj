import { expect, test, type Locator } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// The board uses the designer's exported icons / images from public/sun_kudos/
// (Figma MM_MEDIA_* layers) instead of hand-drawn placeholders.

const maskOf = (l: Locator) => l.evaluate((el) => getComputedStyle(el).getPropertyValue("mask-image") || getComputedStyle(el).getPropertyValue("-webkit-mask-image"));

test.use({ viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ context, page }) => {
  await signInAsNewTestUser(context);
  await page.goto("/sun-kudos");
  await expect(page.getByTestId("kudo-card").first()).toBeVisible();
});

test("icons are the exported SVGs (MM_MEDIA_*)", async ({ page }) => {
  const icon = (scope: Locator, name: string) => scope.locator(`[data-icon="${name}"]`).first();
  const card = page.getByTestId("kudo-card").first();
  const cases: [Locator, string][] = [
    [page.getByRole("button", { name: /Hôm nay, bạn muốn gửi lời cảm ơn/ }), "pencil"],
    [page.getByRole("button", { name: "Tìm kiếm profile Sunner" }), "search"],
    [page.getByRole("button", { name: "Hashtag" }), "down"],
    [page.getByTestId("highlight-viewport"), "left"],
    [page.getByTestId("highlight-viewport"), "right"],
    [page.getByTestId("highlight-pager").locator(".."), "left"],
    [card, "send"],
    [card, "pencil"],
    [card.getByRole("button", { name: "Copy Link" }), "link"],
    [card, "heart"],
    [page.getByTestId("highlight-card").first().getByRole("link", { name: "Xem chi tiết" }), "up"],
    [page.getByRole("button", { name: "Mở Secret Box" }), "gift"],
    [page.getByTestId("spotlight-board"), "zoom"],
    [page.getByTestId("spotlight-board"), "search"],
  ];
  for (const [scope, name] of cases) {
    expect(await maskOf(icon(scope, name)), name).toContain(`/sun_kudos/icon_${name}.svg`);
  }
});

test("hero badge is the exported artwork (title and border included)", async ({ page }) => {
  const badge = page.getByTestId("hero-badge").first();
  await expect(badge).toHaveJSProperty("tagName", "IMG");
  await expect(badge).toHaveAttribute("alt", /^(New|Rising|Super|Legend) Hero$/);
  await expect(badge).toHaveAttribute("src", /badge-(new|rising|super|legend)-hero\.png/);
  const b = await badge.boundingBox();
  expect(b && [b.width, b.height]).toEqual([109, 19]);
});

test("Spotlight background: \"Root further\" artwork with the network layer on top", async ({ page }) => {
  const imgs = page.getByTestId("spotlight-board").locator("img");
  await expect(imgs).toHaveCount(2);
  // Texture first (bottom), then the semi-transparent network lines (no blend mode).
  await expect(imgs.nth(0)).toHaveAttribute("src", /spotlight-texture\.png/);
  await expect(imgs.nth(1)).toHaveAttribute("src", /spotlight-bg\.png/);
  expect(await imgs.nth(1).evaluate((el) => getComputedStyle(el).mixBlendMode)).toBe("normal");
});

test("no stars next to the hero badge (not in Figma)", async ({ page }) => {
  await expect(page.getByLabel(/Sunner đã nhận được (10|20|50) Kudos/)).toHaveCount(0);
  await expect(page.getByTestId("kudo-card").first().locator("svg")).toHaveCount(0);
});
