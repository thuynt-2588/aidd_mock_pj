import { expect, test, type Page } from "@playwright/test";

// Component E2E for "Dropdown-ngôn ngữ" (MoMorph hUyaaugye2, Figma 721:4942),
// exercised on /login where the selector is public.

const LOGIN = "/login";

const trigger = (page: Page) => page.getByRole("button", { name: /VN|EN/ });
const menu = (page: Page) => page.getByRole("menu");
const option = (page: Page, name: "VN" | "EN") => page.getByRole("menuitemradio", { name });

test("A: click opens and closes the list with VN and EN, each with a flag", async ({ page }) => {
  await page.goto(LOGIN);
  await trigger(page).click();
  await expect(menu(page)).toBeVisible();
  for (const name of ["VN", "EN"] as const) {
    await expect(option(page, name)).toBeVisible();
    await expect(option(page, name).locator("img")).toHaveCount(1);
  }
  await trigger(page).click();
  await expect(menu(page)).toHaveCount(0);
});

test("A.1 / A.2: the current language is the selected item with the highlight", async ({ page }) => {
  await page.goto(LOGIN);
  await trigger(page).click();
  await expect(option(page, "VN")).toHaveAttribute("aria-checked", "true");
  await expect(option(page, "EN")).toHaveAttribute("aria-checked", "false");
  // Figma: selected row rgba(255, 234, 158, 0.2), radius 2px.
  await expect(option(page, "VN")).toHaveCSS("background-color", "rgba(255, 234, 158, 0.2)");
  await expect(option(page, "VN")).toHaveCSS("border-radius", "2px");
  await expect(option(page, "EN")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("A: list panel matches Figma (border #998C5F, bg #00070C, radius 8, padding 6)", async ({ page }) => {
  await page.goto(LOGIN);
  await trigger(page).click();
  const panel = menu(page);
  await expect(panel).toHaveCSS("border-top-color", "rgb(153, 140, 95)");
  await expect(panel).toHaveCSS("border-top-width", "1px");
  await expect(panel).toHaveCSS("background-color", "rgb(0, 7, 12)");
  await expect(panel).toHaveCSS("border-radius", "8px");
  await expect(panel).toHaveCSS("padding-top", "6px");
  const box = await option(page, "EN").boundingBox();
  expect(box?.height).toBe(56);
});

test("A.2: choosing EN closes the list, updates the trigger and marks EN selected", async ({ page }) => {
  await page.goto(LOGIN);
  await trigger(page).click();
  await option(page, "EN").click();
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toContainText("EN");
  await expect(trigger(page).locator("img").first()).toHaveAttribute("src", /flag-en/);

  await trigger(page).click();
  await expect(option(page, "EN")).toHaveAttribute("aria-checked", "true");
  await expect(option(page, "VN")).toHaveAttribute("aria-checked", "false");

  // A.1: back to VN.
  await option(page, "VN").click();
  await expect(trigger(page)).toContainText("VN");
});

test("A: Escape and an outside click close the list", async ({ page }) => {
  await page.goto(LOGIN);
  await trigger(page).click();
  await page.keyboard.press("Escape");
  await expect(menu(page)).toHaveCount(0);

  await trigger(page).click();
  await page.mouse.click(5, 500);
  await expect(menu(page)).toHaveCount(0);
});
