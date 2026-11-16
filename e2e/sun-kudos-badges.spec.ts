import { execFileSync } from "node:child_process";

import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// Hero badge + campaign hovers (design "Hover danh hiệu …" / "Hover campain").

test.use({ viewport: { width: 1440, height: 900 } });

const TOOLTIP_TITLE: Record<string, RegExp> = {
  "New Hero": /^Có 1–4 người gửi Kudos cho bạn$/,
  "Rising Hero": /^Có 5–9 người gửi Kudos cho bạn$/,
  "Super Hero": /^Có 10–20 người gửi Kudos cho bạn$/,
  "Legend Hero": /^Có hơn 20 người gửi Kudos cho bạn$/,
};

async function open(page: Page) {
  await page.goto("/sun-kudos");
  await expect(page.getByTestId("kudo-card").first()).toBeVisible();
}

test.describe("hero badges", () => {
  test.beforeEach(async ({ context, page }) => {
    await signInAsNewTestUser(context);
    await open(page);
  });

  test("hovering a badge shows its tier, the 2x badge and the description", async ({ page }) => {
    const card = page.getByTestId("kudo-card").first();
    const badge = card.getByTestId("hero-badge").first();
    const name = (await badge.getAttribute("alt"))!;
    expect(Object.keys(TOOLTIP_TITLE)).toContain(name);

    const tooltip = card.getByRole("tooltip").first();
    await expect(tooltip).toBeHidden();
    await badge.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.getByTestId("hero-tooltip-title")).toHaveText(TOOLTIP_TITLE[name]);
    await expect(tooltip.getByTestId("hero-tooltip-text")).not.toBeEmpty();
    const large = tooltip.getByTestId("hero-badge-large");
    await expect(large).toHaveAttribute("src", /badge-(new|rising|super|legend)-hero\.png/);
    const big = await large.boundingBox();
    expect(big && [big.width, big.height]).toEqual([218, 38]);
  });

  test("keyboard focus also opens the badge hover", async ({ page }) => {
    // The focusable wrapper around the pill.
    await page.getByTestId("kudo-card").first().getByTestId("hero-badge").first().locator("..").focus();
    await expect(page.getByTestId("kudo-card").first().getByRole("tooltip").first()).toBeVisible();
  });

  test("seed shows every tier: Super and Legend badges with their hovers", async ({ page }) => {
    for (const name of ["Super Hero", "Legend Hero"]) {
      // All Kudos cards (side cards of the highlight carousel are inert).
      const badge = page.getByTestId("kudo-card").locator(`[data-testid="hero-badge"][alt="${name}"]`).first();
      await badge.scrollIntoViewIfNeeded();
      await badge.hover();
      // The hover card next to this badge (pill → focusable span → wrapper).
      const title = badge.locator("../..").getByTestId("hero-tooltip-title");
      await expect(title).toBeVisible();
      await expect(title).toHaveText(TOOLTIP_TITLE[name]);
    }
  });

  test("each tier shows its own exported badge image", async ({ page }) => {
    for (const [name, file] of [["New Hero", "new"], ["Rising Hero", "rising"], ["Super Hero", "super"], ["Legend Hero", "legend"]]) {
      const badge = page.locator(`[data-testid="hero-badge"][alt="${name}"]`).first();
      await expect(badge).toHaveAttribute("src", new RegExp(`badge-${file}-hero\\.png`));
    }
  });
});

// The special day lives in the DB (admin-only table): add today's Vietnam date
// for this block only, through the local Supabase container.
// -q: no "INSERT 0 n" status line, so only RETURNING rows come back.
const DB = ["exec", "supabase_db_aidd_mock_pj", "psql", "-U", "postgres", "-d", "postgres", "-q", "-At", "-c"];
const sql = (q: string) => execFileSync("docker", [...DB, q], { encoding: "utf8" }).trim();
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const [, mm, dd] = today.split("-");

test.describe.serial("D.1.4 campaign (x2 hearts)", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsNewTestUser(context);
  });

  test("no campaign icon on a normal day", async ({ page }) => {
    test.skip(sql(`select count(*) from public.special_days where day = '${today}'`) !== "0", "today is already a special day");
    await open(page);
    await expect(page.getByText("Số tim bạn nhận được:")).toBeVisible();
    await expect(page.getByTestId("special-day-badge")).toHaveCount(0);
  });

  test("special day: campaign icon, hover explains the x2 hearts", async ({ page }) => {
    const added = sql(`insert into public.special_days (day) values ('${today}') on conflict do nothing returning day`) !== "";
    try {
      await open(page);
      const badge = page.getByTestId("special-day-badge");
      await expect(badge.locator("img").first()).toHaveAttribute("src", /icon_campain\.svg/);
      // White "x2" (black stroke) on the flame, as in the design.
      await expect(badge.getByTestId("campaign-x2").first()).toHaveText("x2");
      await expect(badge.getByTestId("campaign-x2").first()).toBeVisible();
      // Sits right after the label text; the number stays on the right edge.
      // Right edge of the label TEXT (not its box, which may stretch).
      const textRight = await page.getByText("Số tim bạn nhận được:").evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().right;
      });
      const icon = await badge.boundingBox();
      const gap = icon!.x - textRight;
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(8);
      // StatRow = [label + icon] [value]: the value is the row's last child.
      const rowLocator = page.getByText("Số tim bạn nhận được:").locator("../..");
      const value = await rowLocator.locator(":scope > span").last().boundingBox();
      const row = await rowLocator.boundingBox();
      expect(Math.round(row!.x + row!.width - (value!.x + value!.width))).toBe(0);

      await badge.hover();
      const tooltip = page.getByRole("tooltip", { name: /Ngày x2 tim/ });
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText("Ngày x2 tim – lan tỏa gấp đôi yêu thương!");
      await expect(tooltip).toContainText(`Từ 00:00 ngày ${dd}/${mm} đến 23:59 ngày ${dd}/${mm}, tất cả tim bạn nhận được đều được nhân đôi.`);
    } finally {
      if (added) sql(`delete from public.special_days where day = '${today}'`);
    }
  });
});
