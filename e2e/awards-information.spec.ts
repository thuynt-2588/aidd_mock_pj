import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// Screen-level E2E for "Hệ thống giải" (MoMorph screen zFYDgyj_pD).
// Each authenticated test gets its own throwaway local Supabase user.

const PAGE = "/awards-information";
const LOGIN = "/login";

// [award title, slug, menu label]
const AWARDS: [string, string, string?][] = [
  ["Top Talent", "top-talent"],
  ["Top Project", "top-project"],
  ["Top Project Leader", "top-project-leader"],
  ["Best Manager", "best-manager"],
  ["Signature 2025 - Creator", "signature-2025-creator"],
  ["MVP (Most Valuable Person)", "mvp", "MVP"],
];

const menu = (page: Page) => page.getByRole("navigation", { name: /Danh mục giải thưởng|Award categories/ });
const award = (page: Page, title: string) => page.getByRole("region", { name: title, exact: true });

test("redirects visitors without a session to /login", async ({ page }) => {
  await page.goto(PAGE);
  await expect(page).toHaveURL(LOGIN);
});

test.describe("signed in", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsNewTestUser(context);
  });

  test("renders the award system in Vietnamese", async ({ page }) => {
    await page.goto(PAGE);
    await expect(page).toHaveURL(PAGE);

    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Awards Information" })).toHaveAttribute("aria-current", "page");
    await expect(header.getByRole("link", { name: "About SAA 2025" })).toHaveAttribute("href", "/");

    await expect(page.getByRole("heading", { level: 1, name: "Hệ thống giải thưởng SAA 2025" })).toBeVisible();
    await expect(page.getByText("Sun* Annual Awards 2025", { exact: true })).toBeVisible();

    for (const [title, slug, menuLabel = title] of AWARDS) {
      await expect(menu(page).getByRole("link", { name: menuLabel, exact: true })).toHaveAttribute("href", `#${slug}`);
      await expect(award(page, title)).toHaveAttribute("id", slug);
    }

    const topTalent = award(page, "Top Talent");
    await expect(topTalent.getByText("Số lượng giải thưởng:")).toBeVisible();
    await expect(topTalent.getByText("10", { exact: true })).toBeVisible();
    await expect(topTalent.getByText("Cá nhân", { exact: true })).toBeVisible();
    await expect(topTalent.getByText("7.000.000 VNĐ")).toBeVisible();
    await expect(topTalent.getByText("cho mỗi giải thưởng")).toBeVisible();

    const topProject = award(page, "Top Project");
    await expect(topProject.getByText("02", { exact: true })).toBeVisible();
    await expect(topProject.getByText("Tập thể", { exact: true })).toBeVisible();
    await expect(topProject.getByText("15.000.000 VNĐ")).toBeVisible();

    const signature = award(page, "Signature 2025 - Creator");
    await expect(signature.getByText("5.000.000 VNĐ")).toBeVisible();
    await expect(signature.getByText("Hoặc", { exact: true })).toBeVisible();
    await expect(signature.getByText("8.000.000 VNĐ")).toBeVisible();
    await expect(signature.getByText("cho giải tập thể")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Sun* Kudos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chi tiết" })).toHaveAttribute("href", "/sun-kudos");
    await expect(page.getByRole("contentinfo").getByText("Bản quyền thuộc về Sun* © 2025")).toBeVisible();
  });

  test("marks the first category active on load", async ({ page }) => {
    await page.goto(PAGE);
    await expect(menu(page).getByRole("link", { name: "Top Talent", exact: true })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("clicking a menu item scrolls to that award and marks it active", async ({ page }) => {
    await page.goto(PAGE);
    const mvpLink = menu(page).getByRole("link", { name: "MVP", exact: true });
    await mvpLink.click();

    await expect(page).toHaveURL(`${PAGE}#mvp`);
    await expect(award(page, "MVP (Most Valuable Person)").getByRole("heading")).toBeInViewport();
    await expect(mvpLink).toHaveAttribute("aria-current", "location");
    await expect(menu(page).getByRole("link", { name: "Top Talent", exact: true })).not.toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("a homepage award link opens the matching award", async ({ page }) => {
    await page.goto(`${PAGE}#best-manager`);
    await expect(award(page, "Best Manager").getByRole("heading")).toBeInViewport();
    await expect(menu(page).getByRole("link", { name: "Best Manager", exact: true })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("scrolling the page moves the active category", async ({ page }) => {
    await page.goto(PAGE);
    await page.evaluate(() => document.getElementById("top-project-leader")?.scrollIntoView({ block: "start" }));
    await expect(menu(page).getByRole("link", { name: "Top Project Leader", exact: true })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("switches the copy to English from the locale cookie", async ({ context, page }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: "127.0.0.1", path: "/" }]);
    await page.goto(PAGE);
    await expect(page.getByRole("heading", { level: 1, name: "SAA 2025 award system" })).toBeVisible();
    await expect(award(page, "Top Talent").getByText("Number of awards:")).toBeVisible();
    await expect(page.getByText("Copyright by Sun* © 2025")).toBeVisible();
  });
});
