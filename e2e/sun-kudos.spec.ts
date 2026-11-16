import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// Screen-level E2E for "Sun* Kudos - Live board" (MoMorph MaZUn5xHXZ).
// Needs the local Supabase with supabase/seed.sql loaded (60 kudos).

const KUDOS = "/sun-kudos";
const PAGE_SIZE = 5;

const highlightCards = (page: Page) => page.getByTestId("highlight-card");
const pager = (page: Page) => page.getByTestId("highlight-pager");
const feedCards = (page: Page) => page.getByTestId("kudo-card");
// A filter change re-renders the page on the server and a heart is saved by a
// Server Action; under parallel workers `next dev` can take longer than the
// default 5s for either.
const NAVIGATION = { timeout: 15_000 };

test("redirects visitors without a session to /login", async ({ page }) => {
  await page.goto(KUDOS);
  await expect(page).toHaveURL("/login");
});

test.describe("signed in", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsNewTestUser(context);
  });

  test("renders every section in Vietnamese", async ({ page }) => {
    await page.goto(KUDOS);
    await expect(page.getByRole("banner").getByRole("link", { name: "Sun* Kudos" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Hệ thống ghi nhận và cảm ơn" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hôm nay, bạn muốn gửi lời cảm ơn/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "HIGHLIGHT KUDOS" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "SPOTLIGHT BOARD" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ALL KUDOS" })).toBeVisible();
    await expect(page.getByText(/^\d+ KUDOS$/)).toBeVisible();
    await expect(page.getByText("Số Kudos bạn nhận được:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Mở Secret Box" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /10 SUNNER NHẬN QUÀ/ })).toBeVisible();
    await expect(page.getByTestId("gift-recipient").first()).toBeVisible();
  });

  test("switches the copy to English from the locale cookie", async ({ context, page }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: "127.0.0.1", path: "/" }]);
    await page.goto(KUDOS);
    await expect(page.getByText("Number of Kudos you received:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Secret Box" })).toBeVisible();
  });

  test("B: highlight carousel shows the 5 most-hearted kudos with 1/5 paging", async ({ page }) => {
    await page.goto(KUDOS);
    await expect(highlightCards(page)).toHaveCount(5);
    await expect(pager(page)).toHaveText("1/5");
    const prev = page.getByRole("button", { name: /Kudos trước/ }).first();
    const next = page.getByRole("button", { name: /Kudos tiếp theo/ }).first();
    await expect(prev).toBeDisabled();

    await next.click();
    await expect(pager(page)).toHaveText("2/5");
    for (let i = 0; i < 3; i++) await next.click();
    await expect(pager(page)).toHaveText("5/5");
    await expect(next).toBeDisabled();
  });

  test("C: All Kudos shows 5 cards; 'Xem thêm' loads 5 more (no auto-load on scroll)", async ({ page }) => {
    await page.goto(KUDOS);
    await expect(feedCards(page)).toHaveCount(PAGE_SIZE);
    const more = page.getByRole("button", { name: "Xem thêm" });
    await more.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(1500);
    await expect(feedCards(page)).toHaveCount(PAGE_SIZE);

    await expect(more).toBeEnabled();
    await more.click();
    await expect(feedCards(page)).toHaveCount(PAGE_SIZE * 2, NAVIGATION);
  });

  test("D: the sidebar has no scroll of its own; only the gift list scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KUDOS);
    const aside = page.getByRole("complementary");
    const overflowY = (el: Element) => getComputedStyle(el).overflowY;
    expect(["auto", "scroll"]).not.toContain(await aside.evaluate(overflowY));
    // Nothing in the sidebar is cut off.
    expect(await aside.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    const list = page.getByTestId("gift-recipient").first().locator("..");
    expect(await list.evaluate(overflowY)).toBe("auto");
  });

  test("C.4.1: heart toggles the count and the active state", async ({ page }) => {
    await page.goto(KUDOS);
    const heart = feedCards(page).first().getByRole("button", { name: /tim|heart/i });
    const before = Number((await heart.textContent())?.replace(/\D/g, "") || 0);
    await expect(heart).toHaveAttribute("aria-pressed", "false");

    // A click before hydration is a no-op (state stays "false"): retry it then.
    await expect(async () => {
      if ((await heart.getAttribute("aria-pressed")) === "false") await heart.click();
      await expect(heart).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    await expect(heart).toContainText(String(before + 1));
    // The button is disabled while the Server Action saves the heart.
    await expect(heart).toBeEnabled(NAVIGATION);

    // Persisted: survives a reload.
    await page.reload();
    const again = feedCards(page).first().getByRole("button", { name: /tim|heart/i });
    await expect(again).toHaveAttribute("aria-pressed", "true");
    await expect(async () => {
      if ((await again.getAttribute("aria-pressed")) === "true") await again.click();
      await expect(again).toHaveAttribute("aria-pressed", "false", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    await expect(again).toContainText(String(before));
    await expect(again).toBeEnabled(NAVIGATION);
  });

  test("C.4.2: Copy Link copies the kudos URL and shows the toast", async ({ context, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(KUDOS);
    await feedCards(page).first().getByRole("button", { name: "Copy Link" }).click();
    await expect(page.getByText("Link copied — ready to share!")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/\/sun-kudos\/[0-9a-f-]{36}$/);
  });

  test("B.1.1: filtering by hashtag narrows both lists and resets paging", async ({ page }) => {
    await page.goto(KUDOS);
    await page.getByRole("button", { name: "Hashtag" }).click();
    await page.getByRole("menuitemradio", { name: "#Supportive" }).click();
    await expect(page).toHaveURL(/hashtag=%23Supportive/, NAVIGATION);
    await expect(pager(page)).toHaveText(/^1\//);
    for (const card of await feedCards(page).all()) await expect(card).toContainText("#Supportive");
    for (const card of await highlightCards(page).all()) await expect(card).toContainText("#Supportive");
  });

  test("B.1.2: filtering by department narrows the list", async ({ page }) => {
    await page.goto(KUDOS);
    await page.getByRole("button", { name: "Phòng ban" }).click();
    await page.getByRole("menuitemradio", { name: "CEVC10" }).click();
    await expect(page).toHaveURL(/department=CEVC10/, NAVIGATION);
    await expect(feedCards(page).first()).toBeVisible();
    for (const card of await feedCards(page).all()) await expect(card).toContainText("CEVC10");
  });

  test("C.3.7: clicking a hashtag on a card applies it as the filter", async ({ page }) => {
    await page.goto(KUDOS);
    const tag = feedCards(page).first().getByRole("link", { name: /^#/ }).first();
    const name = (await tag.textContent())!.trim();
    await tag.click();
    await expect(page).toHaveURL(new RegExp(`hashtag=${encodeURIComponent(name)}`), NAVIGATION);
  });

  test("B.7: Spotlight shows receivers, the live feed and finds a Sunner", async ({ page }) => {
    await page.goto(KUDOS);
    const board = page.getByTestId("spotlight-board");
    await expect(board.getByText("Nguyễn Văn Quy", { exact: true })).toBeVisible();
    await expect(board.getByText(/đã nhận được một Kudos mới/).first()).toBeVisible();

    await board.getByRole("searchbox").fill("Hoàng Linh");
    await board.getByRole("searchbox").press("Enter");
    await expect(board.getByText("Nguyễn Hoàng Linh", { exact: true })).toHaveAttribute("data-match", "true");
  });
});
