import { expect, test, type Page } from "@playwright/test";

// Screen-level E2E for "Countdown - Prelaunch page" (MoMorph 8PJQswPZmU).
// Before NEXT_PUBLIC_SITE_OPEN_AT every page redirects to /prelaunch; after
// it (or when unset) /prelaunch sends visitors home. The server clock cannot
// be faked, so each block runs only against a server in the matching state:
//   locked: NEXT_PUBLIC_SITE_OPEN_AT in the future
//   open:   NEXT_PUBLIC_SITE_OPEN_AT unset or in the past

const PRELAUNCH = "/prelaunch";
const MINUTE = 60_000;

const countdown = (page: Page) => page.getByTestId("prelaunch-countdown");
const unit = (page: Page, name: "days" | "hours" | "minutes") => page.getByTestId(`prelaunch-${name}`);

async function expectCountdown(page: Page, days: string, hours: string, minutes: string) {
  await expect(unit(page, "days")).toHaveText(days);
  await expect(unit(page, "hours")).toHaveText(hours);
  await expect(unit(page, "minutes")).toHaveText(minutes);
}

/** True when the running server is before the opening time. */
async function isLocked(page: Page): Promise<boolean> {
  await page.goto(PRELAUNCH);
  return new URL(page.url()).pathname === PRELAUNCH;
}

test.describe("before the website opens", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await isLocked(page)), "server is past NEXT_PUBLIC_SITE_OPEN_AT (or it is unset)");
  });

  test("redirects every page to the countdown", async ({ page }) => {
    for (const path of ["/", "/login", "/awards-information", "/sun-kudos"]) {
      await page.goto(path);
      await expect(page).toHaveURL(PRELAUNCH);
    }
  });

  test("renders the title and DAYS / HOURS / MINUTES in Vietnamese", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sự kiện sẽ bắt đầu sau" })).toBeVisible();
    for (const label of ["DAYS", "HOURS", "MINUTES"]) {
      await expect(countdown(page).getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("switches the title to English from the locale cookie", async ({ context, page }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: "127.0.0.1", path: "/" }]);
    await page.goto(PRELAUNCH);
    await expect(page.getByRole("heading", { name: "Event starts in" })).toBeVisible();
  });

  test("counts down to the opening time", async ({ page }) => {
    const openMs = Date.parse((await countdown(page).getAttribute("data-open-at")) ?? "");
    const remaining = ((2 * 24 + 3) * 60 + 4) * MINUTE + 30_000; // 2d 3h 4m 30s
    await page.clock.install({ time: openMs - remaining });
    await page.goto(PRELAUNCH);
    await expectCountdown(page, "02", "03", "04");

    await page.clock.runFor(MINUTE);
    await expectCountdown(page, "02", "03", "03");
  });

  test("heads for the homepage when the countdown reaches zero", async ({ page }) => {
    const openMs = Date.parse((await countdown(page).getAttribute("data-open-at")) ?? "");
    await page.clock.install({ time: openMs - 3_000 });
    await page.goto(PRELAUNCH);
    await expectCountdown(page, "00", "00", "00");
    // Only the browser clock is moved: the server is still locked and would
    // send "/" back here, so assert the navigation request itself.
    const home = page.waitForRequest((req) => new URL(req.url()).pathname === "/");
    await page.clock.runFor(5_000);
    await home;
  });
});

test.describe("after the website opens", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(await isLocked(page), "server is before NEXT_PUBLIC_SITE_OPEN_AT");
  });

  test("sends /prelaunch home and leaves other pages alone", async ({ page }) => {
    await page.goto(PRELAUNCH);
    await expect(page).not.toHaveURL(PRELAUNCH); // "/" → /login for guests
    await page.goto("/login");
    await expect(page).toHaveURL("/login");
  });
});
