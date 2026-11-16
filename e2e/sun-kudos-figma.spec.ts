import { expect, test, type Locator, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// Pixel checks of "Sun* Kudos - Live board" against Figma 2940:13431 at the
// 1440px design width (values from plans/261111-sun-kudos/momorph/frame-styles.txt).

test.use({ viewport: { width: 1440, height: 900 } });

async function box(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no box");
  return b;
}

const css = (locator: Locator, prop: string) => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

async function open(page: Page) {
  await page.goto("/sun-kudos");
  await expect(page.getByTestId("highlight-card").first()).toBeVisible();
}

test.describe("Figma 2940:13431 at 1440", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsNewTestUser(context);
  });

  test("Frame 532: 64px from the A.1 pills to the Highlight header", async ({ page }) => {
    await open(page);
    const pill = await box(page.getByRole("button", { name: /Hôm nay, bạn muốn gửi lời cảm ơn/ }));
    const caption = await box(page.getByTestId("kudos-section-header").first());
    expect(caption.y - (pill.y + pill.height)).toBe(64);
  });

  test("MM_MEDIA_Kudos logo is 593px wide", async ({ page }) => {
    await open(page);
    expect((await box(page.getByRole("img", { name: "SAA 2025 KUDOS" }))).width).toBe(593);
  });

  test("B.2: 525px high, side cards not faded, 60px arrows, next arrow centred in its 400px gradient", async ({ page }) => {
    await open(page);
    expect((await box(page.getByTestId("highlight-viewport"))).height).toBe(525);
    for (const card of await page.getByTestId("highlight-card").all()) expect(await css(card.locator(".."), "opacity")).toBe("1");

    const next = page.getByTestId("highlight-viewport").getByRole("button", { name: "Kudos tiếp theo" });
    expect((await box(next.locator("[data-icon]"))).width).toBe(60);
    const b = await box(next);
    // Frame 527: 400 wide, padding-left 80 / right 40, justify centre → button at x 180..260.
    expect(1440 - (b.x + b.width)).toBe(140);
  });

  test("B.3/B.4.4: highlight card 533 high, action row at y 457, hearts 32 high", async ({ page }) => {
    await open(page);
    for (const card of await page.getByTestId("highlight-card").all()) {
      const c = await box(card);
      // 4 border + 24 pad + 123 people + 16 + 1 + 16 + 240 (B.4) + 16 + 1 + 16 = 457; + 56 action + 16 pad + 4 border.
      expect(c.height).toBe(533);
      const action = await box(card.locator(":scope > :last-child"));
      expect([action.y - c.y, action.height]).toEqual([457, 56]);
      expect((await box(card.locator("button[aria-pressed]"))).height).toBe(32);
    }
    // B.4.4 order: hearts left · Copy Link middle · Xem chi tiết right.
    const card = page.getByTestId("highlight-card").first();
    const c = await box(card);
    const heart = await box(card.locator("button[aria-pressed]"));
    const copy = await box(card.getByRole("button", { name: "Copy Link" }));
    const detail = await box(card.getByRole("link", { name: "Xem chi tiết" }));
    expect(heart.x - c.x).toBe(28);
    expect(Math.round(c.x + c.width - (detail.x + detail.width))).toBe(28);
    expect(heart.x + heart.width).toBeLessThan(copy.x);
    expect(copy.x + copy.width).toBeLessThan(detail.x);
    // The 533px card overflows the 525px B.2 frame by 4px top/bottom: borders stay visible.
    expect(await css(page.getByTestId("highlight-viewport"), "overflow-y")).toBe("visible");
  });

  test("B.5.2: current page large bold yellow, '/5' smaller, lighter grey", async ({ page }) => {
    await open(page);
    const pager = page.getByTestId("highlight-pager");
    await expect(pager).toHaveText(/^1\/\d+$/);
    const current = pager.getByTestId("highlight-pager-current");
    await expect(current).toHaveText("1");
    expect(await css(current, "color")).toBe("rgb(255, 234, 158)");
    expect(await css(current, "font-size")).toBe("40px");
    expect(await css(current, "font-weight")).toBe("700");
    // Reference image: "2" cap 19px vs "5" cap 12px (≈1.6x), thinner strokes on "/5".
    expect(await css(pager, "color")).toBe("rgb(153, 153, 153)");
    expect(await css(pager, "font-size")).toBe("24px");
    expect(await css(pager, "font-weight")).toBe("600");
  });

  test("C.4: feed card hearts left, Copy Link right", async ({ page }) => {
    await open(page);
    const card = page.getByTestId("kudo-card").first();
    const c = await box(card);
    const heart = await box(card.locator("button[aria-pressed]"));
    const copy = await box(card.getByRole("button", { name: "Copy Link" }));
    // 40px side padding on the 680px feed card.
    expect(heart.x - c.x).toBe(40);
    expect(Math.round(c.x + c.width - (copy.x + copy.width))).toBe(40);
  });

  test("Frame 502: 80px between the All Kudos list and the sidebar", async ({ page }) => {
    await open(page);
    const feed = await box(page.getByTestId("kudo-card").first());
    const sidebar = await box(page.getByRole("complementary"));
    expect(feed.x).toBe(144);
    expect(sidebar.x - (feed.x + feed.width)).toBe(80);
  });

  test("B.7: board is 1157px wide; live feed text 14/20", async ({ page }) => {
    await open(page);
    const board = page.getByTestId("spotlight-board");
    expect((await box(board)).width).toBe(1157);
    const line = board.getByText(/đã nhận được một Kudos mới/).first();
    expect(await css(line, "font-size")).toBe("14px");
    expect(await css(line, "line-height")).toBe("20px");
    expect(await css(line, "letter-spacing")).toBe("0.1px");
  });

  test("B.7.1/B.7.2/B.7.3: search top-left, total centred at the top, pan/zoom bottom-right", async ({ page }) => {
    await open(page);
    const board = page.getByTestId("spotlight-board");
    // Offsets from the inside of the 1px #998C5F border.
    const o = await box(board);
    const b = { x: o.x + 1, y: o.y + 1, width: o.width - 2, height: o.height - 2 };
    const search = await box(board.getByRole("search"));
    expect([search.x - b.x, search.y - b.y]).toEqual([24, 24]);
    const total = await box(board.getByText(/^\d+ KUDOS$/));
    expect(Math.abs(total.x + total.width / 2 - (b.x + b.width / 2))).toBeLessThanOrEqual(1);
    expect(total.y - b.y).toBe(16);
    const zoom = await box(board.getByRole("button", { name: "Pan/Zoom" }));
    expect([b.x + b.width - (zoom.x + zoom.width), b.y + b.height - (zoom.y + zoom.height)]).toEqual([40, 40]);
  });

  test("C.3 D.4: pen icon after the title on feed cards only", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("kudo-card").first().getByTestId("kudo-title-pen")).toBeVisible();
    await expect(page.getByTestId("highlight-card").getByTestId("kudo-title-pen")).toHaveCount(0);
    expect((await box(page.getByTestId("kudo-card").first().getByTestId("kudo-title-pen"))).width).toBe(32);
  });

  test("D.3.4: gift text right-aligned, tracking 0.15px, in a 230px column", async ({ page }) => {
    await open(page);
    const gift = page.getByTestId("gift-recipient").first().getByTestId("gift-text");
    expect(await css(gift, "text-align")).toBe("right");
    expect(await css(gift, "letter-spacing")).toBe("0.15px");
    expect((await box(gift)).width).toBe(230);
  });
});
