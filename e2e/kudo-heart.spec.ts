import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// C.4.1 "Thả tim" (MoMorph MaZUn5xHXZ): one heart per user per kudos, the
// sender cannot heart their own kudos, clicking again takes the heart back.
// The basic toggle is in sun-kudos.spec.ts; this spec covers the same kudos
// shown twice (Highlight + All Kudos), the own-kudos rule and a failed save.
//
// Runs as "chromium-writes" (after the read-only specs). Its kudos are made
// directly in the local Supabase container with titles "E2EH …" and deleted
// afterwards (hearts cascade). Titles do not match the "E2E %" clean-up of
// write-kudo.spec.ts, which may run at the same time.
const KUDOS = "/sun-kudos";
const SLOW = { timeout: 15_000 };
const XUAN = "5a000000-0000-4000-8000-000000000001";
const THUY = "5a000000-0000-4000-8000-000000000004";
// "Sunner Fan 01" … "Sunner Fan 20" from the seed.
const FANS = "5a000000-0000-4000-8000-0000000001";

const DB = ["exec", "supabase_db_aidd_mock_pj", "psql", "-U", "postgres", "-d", "postgres", "-q", "-At", "-c"];
const sql = (q: string) => execFileSync("docker", [...DB, q], { encoding: "utf8" }).trim();

/** A kudos with #Teamwork, newest on the board; `fans` seed Sunners have hearted it. */
function makeKudos(senderId: string, fans = 0): { id: string; title: string } {
  const title = `E2EH ${randomUUID().slice(0, 8)}`;
  const id = sql(
    `insert into public.kudos (sender_id, receiver_id, title, content) values ('${senderId}', '${THUY}', '${title}', 'E2E heart ${title}') returning id`,
  ).split("\n")[0];
  sql(`insert into public.kudo_hashtags (kudo_id, hashtag_id) select '${id}', id from public.hashtags where name = '#Teamwork'`);
  if (fans > 0) {
    sql(
      `insert into public.kudo_hearts (kudo_id, user_id) select '${id}', ('${FANS}' || lpad(n::text, 2, '0'))::uuid from generate_series(1, ${fans}) n`,
    );
  }
  return { id, title };
}

const heartIn = (card: ReturnType<Page["getByTestId"]>) => card.getByRole("button", { name: /^Thả tim: \d+$/ });
const feedCard = (page: Page, title: string) => page.getByTestId("kudo-card").filter({ hasText: title });
const highlightCard = (page: Page, title: string) => page.getByTestId("highlight-card").filter({ hasText: title });

/** A click before hydration does nothing: retry until the button reacts. */
async function clickUntil(page: Page, button: ReturnType<Page["getByRole"]>, pressed: "true" | "false") {
  await expect(async () => {
    if ((await button.getAttribute("aria-pressed")) !== pressed) await button.click();
    await expect(button).toHaveAttribute("aria-pressed", pressed, { timeout: 1_000 });
  }).toPass(SLOW);
}

test.describe.serial("C.4.1 Thả tim", () => {
  let email = "";
  test.beforeEach(async ({ context }) => {
    email = await signInAsNewTestUser(context);
  });
  test.afterAll(() => {
    sql("delete from public.kudos where title like 'E2EH %'");
  });

  test("the same kudos in Highlight and All Kudos shows one heart state", async ({ page }) => {
    // 20 hearts: more than any seed kudos, so it is Highlight 1/5 and newest in All Kudos.
    const k = makeKudos(XUAN, 20);
    await page.goto(KUDOS);
    const top = heartIn(highlightCard(page, k.title));
    const feed = heartIn(feedCard(page, k.title));
    await expect(top).toHaveAccessibleName("Thả tim: 20");
    await expect(feed).toHaveAccessibleName("Thả tim: 20");

    await clickUntil(page, feed, "true");
    // The Highlight card follows at once (no reload).
    await expect(top).toHaveAttribute("aria-pressed", "true");
    await expect(top).toHaveAccessibleName("Thả tim: 21");
    await expect(feed).toHaveAccessibleName("Thả tim: 21");
    await expect(feed).toBeEnabled(SLOW);
    expect(sql(`select count(*) from public.kudo_hearts where kudo_id = '${k.id}'`)).toBe("21");

    // Taking it back from the Highlight card updates the feed card too.
    await top.click();
    await expect(feed).toHaveAttribute("aria-pressed", "false");
    await expect(feed).toHaveAccessibleName("Thả tim: 20");
    await expect(top).toBeEnabled(SLOW);
    expect(sql(`select count(*) from public.kudo_hearts where kudo_id = '${k.id}'`)).toBe("20");
  });

  test("the sender cannot heart their own kudos", async ({ page }) => {
    const me = sql(`select id from public.profiles where full_name = '${email.split("@")[0]}'`);
    const k = makeKudos(me);
    await page.goto(KUDOS);
    const heart = heartIn(feedCard(page, k.title));
    await expect(heart).toBeDisabled();
    await expect(heart).toHaveAttribute("title", "Bạn không thể thả tim cho Kudos của chính mình");
    await expect(heart).toHaveAttribute("aria-pressed", "false");
  });

  test("a heart that cannot be saved is undone and explained", async ({ page }) => {
    const k = makeKudos(XUAN);
    await page.goto(KUDOS);
    const heart = heartIn(feedCard(page, k.title));
    await expect(heart).toHaveAccessibleName("Thả tim: 0");
    // Wait for hydration (the Copy Link toast proves handlers are attached).
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await expect(async () => {
      await feedCard(page, k.title).getByRole("button", { name: "Copy Link" }).click();
      await expect(page.getByRole("status")).toBeVisible({ timeout: 1_000 });
    }).toPass(SLOW);

    // Deleted meanwhile (e.g. by an admin): saving the heart fails.
    sql(`delete from public.kudos where id = '${k.id}'`);
    await heart.click();
    await expect(page.getByRole("status")).toHaveText("Không thể thả tim lúc này. Vui lòng thử lại.", SLOW);
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await expect(heart).toHaveAccessibleName("Thả tim: 0");
  });
});
