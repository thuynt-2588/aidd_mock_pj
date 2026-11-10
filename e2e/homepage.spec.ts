import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// Screen-level E2E for the SAA 2025 Homepage (MoMorph screen i87tDx10uM).
// Each authenticated test gets its own throwaway local Supabase user.

const HOME = "/";
const LOGIN = "/login";
const MINUTE = 60_000;

const AWARDS: [string, string][] = [
  ["Top Talent", "top-talent"],
  ["Top Project", "top-project"],
  ["Top Project Leader", "top-project-leader"],
  ["Best Manager", "best-manager"],
  ["Signature 2025 - Creator", "signature-2025-creator"],
  ["MVP (Most Valuable Person)", "mvp"],
];

const accountButton = (page: Page) => page.getByRole("button", { name: /Tài khoản|Account/ });
const countdown = (page: Page) => page.getByTestId("event-countdown");
const unit = (page: Page, name: "days" | "hours" | "minutes") => page.getByTestId(`countdown-${name}`);

async function expectCountdown(page: Page, days: string, hours: string, minutes: string) {
  await expect(unit(page, "days")).toHaveText(days);
  await expect(unit(page, "hours")).toHaveText(hours);
  await expect(unit(page, "minutes")).toHaveText(minutes);
}

test("redirects visitors without a session to /login", async ({ page }) => {
  await page.goto(HOME);
  await expect(page).toHaveURL(LOGIN);
});

test.describe("signed in", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsNewTestUser(context);
  });

  test("renders every homepage section in Vietnamese", async ({ page }) => {
    await page.goto(HOME);
    await expect(page).toHaveURL(HOME);

    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "About SAA 2025" })).toHaveAttribute("aria-current", "page");
    await expect(header.getByRole("link", { name: "Awards Information" })).toHaveAttribute("href", "/awards-information");
    await expect(header.getByRole("link", { name: "Sun* Kudos" })).toHaveAttribute("href", "/sun-kudos");
    await expect(header.getByRole("button", { name: /Thông báo|Notifications/ })).toBeVisible();

    await expect(countdown(page)).toBeVisible();
    await expect(page.getByText("Âu Cơ Art Center")).toBeVisible();
    await expect(page.getByRole("link", { name: "ABOUT AWARDS" })).toHaveAttribute("href", "/awards-information");
    await expect(page.getByRole("link", { name: "ABOUT KUDOS" })).toHaveAttribute("href", "/sun-kudos");
    await expect(page.getByText("“A tree with deep roots fears no storm”")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeVisible();
    for (const [title, slug] of AWARDS) {
      await expect(page.getByRole("link", { name: title, exact: true })).toHaveAttribute(
        "href",
        `/awards-information#${slug}`,
      );
    }

    await expect(page.getByRole("heading", { name: "Sun* Kudos" })).toBeVisible();
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Tiêu chuẩn chung" })).toHaveAttribute("href", "/standards");
    await expect(footer.getByText("Bản quyền thuộc về Sun* © 2025")).toBeVisible();
  });

  test("switches the homepage copy to English from the locale cookie", async ({ context, page }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: "127.0.0.1", path: "/" }]);
    await page.goto(HOME);
    await expect(page.getByRole("heading", { name: "Award categories" })).toBeVisible();
    await expect(page.getByText("Copyright by Sun* © 2025")).toBeVisible();
  });

  test("account menu opens, closes on Escape, and signs out", async ({ page }) => {
    await page.goto(HOME);
    await accountButton(page).click();
    await expect(page.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);

    await accountButton(page).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(LOGIN);

    await page.goto(HOME);
    await expect(page).toHaveURL(LOGIN);
  });

  test("countdown counts down to the configured event start", async ({ page }) => {
    await page.goto(HOME);
    const start = await countdown(page).getAttribute("data-event-start");
    const startMs = start ? Date.parse(start) : NaN;
    test.skip(Number.isNaN(startMs), "NEXT_PUBLIC_EVENT_START_AT is not set on the running dev server");

    const remaining = ((2 * 24 + 3) * 60 + 4) * MINUTE + 30_000; // 2d 3h 4m 30s
    await page.clock.install({ time: startMs - remaining });
    await page.goto(HOME);
    await expect(page.getByText("Coming soon")).toBeVisible();
    await expectCountdown(page, "02", "03", "04");

    await page.clock.runFor(MINUTE);
    await expectCountdown(page, "02", "03", "03");
  });

  test("countdown shows 00 and hides Coming soon once the event has started", async ({ page }) => {
    await page.goto(HOME);
    const start = await countdown(page).getAttribute("data-event-start");
    const startMs = start ? Date.parse(start) : NaN;
    if (!Number.isNaN(startMs)) {
      await page.clock.install({ time: startMs + 60 * MINUTE });
      await page.goto(HOME);
    }
    await expectCountdown(page, "00", "00", "00");
    await expect(page.getByText("Coming soon")).toHaveCount(0);
  });
});
