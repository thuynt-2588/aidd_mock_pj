import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { signInAsNewTestUser } from "./support/create-test-session";

// "Viết Kudo" dialog (MoMorph ihQ26W78P2) opened from A.1 on /sun-kudos.
// Needs the local Supabase with supabase/seed.sql loaded (8 named Sunners,
// hashtags #Dedicated … #Leadership). Each test that sends a kudos uses a
// unique Danh hiệu and finds its card by it (parallel workers add kudos too).

// Runs as the "chromium-writes" project, after the read-only specs. Every
// kudos it sends has a title starting with "E2E " and is deleted afterwards
// through the local Supabase container (hashtags / hearts cascade), so the
// seed data the other specs read stays as it is. Uploaded test images stay in
// Storage (a few bytes each).
const KUDOS = "/sun-kudos";
const deleteTestKudos = () =>
  execFileSync(
    "docker",
    ["exec", "supabase_db_aidd_mock_pj", "psql", "-U", "postgres", "-d", "postgres", "-q", "-c", "delete from public.kudos where title like 'E2E %'"],
    { encoding: "utf8" },
  );
const SLOW = { timeout: 15_000 };
// 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

const dialog = (page: Page) => page.getByRole("dialog", { name: "Gửi lời cám ơn và ghi nhận đến đồng đội" });
const sendButton = (page: Page) => dialog(page).getByRole("button", { name: "Gửi", exact: true });
const editor = (page: Page) => dialog(page).getByRole("textbox", { name: "Nội dung lời cám ơn" });

async function openDialog(page: Page) {
  await page.goto(KUDOS);
  await page.getByRole("button", { name: /Hôm nay, bạn muốn gửi lời cảm ơn/ }).click();
  await expect(dialog(page)).toBeVisible();
}

async function pickRecipient(page: Page, query: string, name: string) {
  const box = dialog(page).getByRole("combobox", { name: "Người nhận" });
  await box.fill(query);
  await dialog(page).getByRole("option", { name }).click();
  await expect(box).toHaveValue(name);
}

async function pickHashtags(page: Page, tags: string[]) {
  await dialog(page).getByRole("button", { name: /Hashtag/ }).click();
  const list = dialog(page).getByRole("listbox", { name: "Hashtag" });
  for (const tag of tags) await list.getByRole("option", { name: tag }).click();
  await page.keyboard.press("Escape");
  await expect(list).toBeHidden();
}

async function fillRequired(page: Page, title: string) {
  await pickRecipient(page, "mai phuong", "Mai Phương Thúy");
  await dialog(page).getByRole("textbox", { name: "Danh hiệu" }).fill(title);
  await editor(page).click();
  await page.keyboard.type("Cảm ơn bạn đã ");
  await dialog(page).getByRole("button", { name: "In đậm" }).click();
  await page.keyboard.type("luôn hỗ trợ");
  await dialog(page).getByRole("button", { name: "In đậm" }).click();
  await page.keyboard.type(" cả team!");
  await pickHashtags(page, ["#Teamwork"]);
}

test.afterAll(() => {
  deleteTestKudos();
});

test.describe("Viết Kudo", () => {
  // The test user's profile name is the e-mail's local part ("e2e-<uuid>").
  let myName = "";
  test.beforeEach(async ({ context }) => {
    myName = (await signInAsNewTestUser(context)).split("@")[0];
  });

  test("A.1 opens the dialog with every field from the design; Hủy closes it", async ({ page }) => {
    await openDialog(page);
    const d = dialog(page);
    await expect(d.getByRole("heading", { name: "Gửi lời cám ơn và ghi nhận đến đồng đội" })).toBeVisible();
    await expect(d.getByRole("combobox", { name: "Người nhận" })).toHaveAttribute("placeholder", "Tìm kiếm");
    await expect(d.getByRole("textbox", { name: "Danh hiệu" })).toHaveAttribute("placeholder", "Dành tặng một danh hiệu cho đồng đội");
    for (const tool of ["In đậm", "In nghiêng", "Gạch ngang", "Danh sách đánh số", "Chèn đường dẫn", "Trích dẫn"]) {
      await expect(d.getByRole("button", { name: tool })).toBeVisible();
    }
    await expect(d.getByRole("link", { name: "Tiêu chuẩn cộng đồng" })).toBeVisible();
    await expect(d.getByText("Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác")).toBeVisible();
    await expect(d.getByRole("button", { name: /Image/ })).toBeVisible();
    await expect(d.getByRole("checkbox", { name: "Gửi lời cám ơn và ghi nhận ẩn danh" })).not.toBeChecked();
    await expect(sendButton(page)).toBeDisabled();

    await d.getByRole("button", { name: "Hủy" }).click();
    await expect(dialog(page)).toBeHidden();
  });

  test("H.2: Gửi is enabled only when recipient, Danh hiệu, content and a hashtag are filled", async ({ page }) => {
    await openDialog(page);
    await pickRecipient(page, "mai phuong", "Mai Phương Thúy");
    await expect(sendButton(page)).toBeDisabled();
    await dialog(page).getByRole("textbox", { name: "Danh hiệu" }).fill("Người truyền động lực");
    await expect(sendButton(page)).toBeDisabled();
    await expect(dialog(page).getByTestId("kudo-counter")).toHaveText("0/1.000");
    await editor(page).click();
    await page.keyboard.type("Cảm ơn bạn!");
    await expect(dialog(page).getByTestId("kudo-counter")).toHaveText("11/1.000");
    // Typed text looks bold (variable font wght 700) but keeps font-weight 400,
    // so the Bold button turns bold ON (see rich-text-font.ts).
    await expect(editor(page)).toHaveCSS("font-weight", "400");
    await expect(editor(page)).toHaveCSS("font-variation-settings", '"wght" 700');
    await expect(sendButton(page)).toBeDisabled();
    await pickHashtags(page, ["#Teamwork"]);
    await expect(sendButton(page)).toBeEnabled();
    // The chip's x removes the hashtag again.
    await dialog(page).getByRole("button", { name: "Xóa #Teamwork" }).click();
    await expect(sendButton(page)).toBeDisabled();
  });

  test("B: the recipient search does not offer yourself and ignores diacritics", async ({ page }) => {
    await openDialog(page);
    const box = dialog(page).getByRole("combobox", { name: "Người nhận" });
    await box.fill("do hoang");
    await expect(dialog(page).getByRole("option", { name: "Đỗ Hoàng Hiệp" })).toBeVisible();
    await box.fill(myName);
    await expect(dialog(page).getByText("Không tìm thấy Sunner")).toBeVisible();
  });

  test("E: at most 5 hashtags; the other rows are disabled", async ({ page }) => {
    await openDialog(page);
    await dialog(page).getByRole("button", { name: /Hashtag/ }).click();
    const list = dialog(page).getByRole("listbox", { name: "Hashtag" });
    for (const tag of ["#Creative", "#Dedicated", "#Inspiring", "#Leadership", "#ProblemSolver"]) {
      await list.getByRole("option", { name: tag }).click();
      await expect(list.getByRole("option", { name: tag })).toHaveAttribute("aria-selected", "true");
    }
    await expect(list.getByRole("option", { name: "#Teamwork" })).toHaveAttribute("aria-disabled", "true");
    await list.getByRole("option", { name: "#Creative" }).click();
    await expect(list.getByRole("option", { name: "#Teamwork" })).not.toHaveAttribute("aria-disabled", "true");
  });

  test("F: up to 5 images; + Image disappears at 5 and x removes one", async ({ page }) => {
    await openDialog(page);
    const files = Array.from({ length: 5 }, (_, i) => ({ name: `p${i}.png`, mimeType: "image/png", buffer: PNG }));
    await dialog(page).locator('input[type="file"]').setInputFiles(files);
    await expect(dialog(page).getByTestId("kudo-image-thumb")).toHaveCount(5);
    await expect(dialog(page).getByRole("button", { name: /Image/ })).toBeHidden();
    await dialog(page).getByRole("button", { name: "Xóa ảnh 1" }).click();
    await expect(dialog(page).getByTestId("kudo-image-thumb")).toHaveCount(4);
    await expect(dialog(page).getByRole("button", { name: /Image/ })).toBeVisible();
  });

  test("sends a kudos with bold text, a link and an image; the card appears on the board", async ({ page }) => {
    const title = `E2E ${randomUUID().slice(0, 8)}`;
    await openDialog(page);
    await fillRequired(page, title);

    // C.5 → "Thêm đường dẫn" box.
    await editor(page).click();
    await page.keyboard.press("End");
    await page.keyboard.type(" ");
    await dialog(page).getByRole("button", { name: "Chèn đường dẫn" }).click();
    const box = page.getByRole("dialog", { name: "Thêm đường dẫn" });
    await box.getByRole("textbox", { name: "Nội dung" }).fill("Sun*");
    await box.getByRole("textbox", { name: "URL" }).fill("https://sun-asterisk.vn");
    await box.getByRole("button", { name: "Lưu" }).click();
    await expect(box).toBeHidden();

    await dialog(page).locator('input[type="file"]').setInputFiles([{ name: "team.png", mimeType: "image/png", buffer: PNG }]);
    await sendButton(page).click();

    await expect(dialog(page)).toBeHidden(SLOW);
    await expect(page.getByRole("status")).toHaveText("Đã gửi Kudos!");
    const card = page.getByTestId("kudo-card").filter({ hasText: title });
    await expect(card).toHaveCount(1, SLOW);
    await expect(card.locator("strong", { hasText: "luôn hỗ trợ" })).toBeVisible();
    await expect(card.getByRole("link", { name: "Sun*", exact: true })).toHaveAttribute("href", "https://sun-asterisk.vn");
    await expect(card.getByText("#Teamwork")).toBeVisible();
    await expect(card.getByRole("img", { name: /Ảnh đính kèm 1/ })).toBeVisible();
    await expect(card.getByRole("link", { name: "Mai Phương Thúy" }).first()).toBeVisible();
  });

  test("G: an anonymous kudos shows the alias, not the sender", async ({ page }) => {
    const title = `E2E anon ${randomUUID().slice(0, 8)}`;
    await openDialog(page);
    await fillRequired(page, title);
    await dialog(page).getByRole("checkbox", { name: "Gửi lời cám ơn và ghi nhận ẩn danh" }).check();
    const nickname = dialog(page).getByRole("textbox", { name: "Nickname ẩn danh" });
    await expect(nickname).toBeVisible();
    // Required once "ẩn danh" is ticked: "Gửi" waits for it.
    await expect(sendButton(page)).toBeDisabled();
    await nickname.fill("Người bí ẩn");
    await expect(sendButton(page)).toBeEnabled();
    await sendButton(page).click();

    await expect(dialog(page)).toBeHidden(SLOW);
    const card = page.getByTestId("kudo-card").filter({ hasText: title });
    await expect(card).toHaveCount(1, SLOW);
    await expect(card.getByText("Người bí ẩn")).toBeVisible();
    await expect(card.getByText(myName)).toHaveCount(0);
  });

  test("D: '@' + name mentions a Sunner; the mention links to their profile on the card", async ({ page }) => {
    const title = `E2E mention ${randomUUID().slice(0, 8)}`;
    await openDialog(page);
    await pickRecipient(page, "le kieu", "Lê Kiều Trang");
    await dialog(page).getByRole("textbox", { name: "Danh hiệu" }).fill(title);
    await editor(page).click();
    // The search after "@" runs up to the caret (no spaces, diacritics ignored).
    await page.keyboard.type("Cảm ơn @hiep");
    await dialog(page).getByRole("option", { name: "Đỗ Hoàng Hiệp" }).click();
    await page.keyboard.type("và team!");
    await pickHashtags(page, ["#Supportive"]);
    await sendButton(page).click();

    await expect(dialog(page)).toBeHidden(SLOW);
    const card = page.getByTestId("kudo-card").filter({ hasText: title });
    await expect(card).toHaveCount(1, SLOW);
    await expect(card.getByTestId("kudo-content")).toHaveText(/Cảm ơn @Đỗ Hoàng Hiệp\s*và team!/);
    await expect(card.getByRole("link", { name: "@Đỗ Hoàng Hiệp", exact: true })).toHaveAttribute("href", /^\/profile\/5a000000-/);
  });
});
