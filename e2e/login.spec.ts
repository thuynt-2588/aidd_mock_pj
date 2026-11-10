import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Screen-level E2E for the SAA 2025 login page (MoMorph screen GzbNeVGJHz).
// Real Google sign-in is not automatable, so the Supabase authorize hop is
// intercepted and only the outgoing request is asserted.

const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:3000`;
const LOGIN_PATH = "/login";
const REDIRECT_TO = `${BASE_URL}/auth/callback`;
const LOCALE_COOKIE = "NEXT_LOCALE";
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

const COPY = {
  vi: {
    intro: "Bắt đầu hành trình của bạn cùng SAA 2025.",
    tagline: "Đăng nhập để khám phá!",
    footer: "Bản quyền thuộc về Sun* © 2025",
    error: "Đăng nhập không thành công. Vui lòng thử lại.",
  },
  en: {
    intro: "Start your journey with SAA 2025.",
    tagline: "Log in to explore!",
    footer: "Copyright by Sun* © 2025",
    error: "Sign-in failed. Please try again.",
  },
} as const;

const loginButton = (page: Page) =>
  page.getByRole("button", { name: "LOGIN With Google" });
// Next.js renders an empty role="alert" route announcer, so the bare
// getByRole('alert') is ambiguous. Narrow by the expected banner text.
const errorBanner = (page: Page, text: string) =>
  page.getByRole("alert").filter({ hasText: text });
const languageTrigger = (page: Page) =>
  page.getByRole("button", { name: /VN|EN/ });

async function setLocale(context: BrowserContext, value: string) {
  await context.addCookies([
    { name: LOCALE_COOKIE, value, domain: HOST, path: "/" },
  ]);
}

async function expectScreenCopy(page: Page, lang: keyof typeof COPY) {
  const copy = COPY[lang];
  await expect(page.getByText(copy.intro)).toBeVisible();
  await expect(page.getByText(copy.tagline)).toBeVisible();
  await expect(page.getByText(copy.footer)).toBeVisible();
}

test("renders the login screen in Vietnamese by default (SC-001)", async ({
  page,
}) => {
  await page.goto(LOGIN_PATH);

  const logo = page.getByRole("img", { name: "Sun* Annual Awards 2025" });
  await expect(logo).toBeVisible();
  await expect(logo.locator("xpath=ancestor-or-self::a")).toHaveCount(0);
  await expect(page.getByRole("img", { name: "ROOT FURTHER" })).toBeVisible();
  await expectScreenCopy(page, "vi");
  await expect(loginButton(page)).toHaveCount(1);
  await expect(loginButton(page)).toBeEnabled();
  await expect(languageTrigger(page)).toContainText("VN");
});

test("switches to English, persists the cookie and survives reload (SC-004)", async ({
  page,
  context,
}) => {
  await page.goto(LOGIN_PATH);
  await expect(languageTrigger(page)).toBeVisible();

  await languageTrigger(page).click();
  await page.getByRole("menuitem", { name: "EN" }).click();

  await expectScreenCopy(page, "en");
  await expect(loginButton(page)).toBeVisible();
  await expect(languageTrigger(page)).toContainText("EN");

  const cookie = (await context.cookies()).find(
    (c) => c.name === LOCALE_COOKIE,
  );
  expect(cookie?.value).toBe("en");

  await page.reload();
  await expectScreenCopy(page, "en");
});

test("falls back to Vietnamese for an unsupported locale cookie (BR-002)", async ({
  page,
  context,
}) => {
  await setLocale(context, "fr");
  await page.goto(LOGIN_PATH);

  await expectScreenCopy(page, "vi");
  await expect(languageTrigger(page)).toContainText("VN");
});

test("shows the sign-in error banner in the active locale and keeps the button enabled (SC-003)", async ({
  page,
  context,
}) => {
  await page.goto(`${LOGIN_PATH}?error=auth_failed`);
  await expect(errorBanner(page, COPY.vi.error)).toBeVisible();
  await expect(loginButton(page)).toBeEnabled();

  await setLocale(context, "en");
  await page.goto(`${LOGIN_PATH}?error=auth_failed`);
  await expect(errorBanner(page, COPY.en.error)).toBeVisible();
  await expect(loginButton(page)).toBeEnabled();
});

test("login click starts the Google PKCE authorize request (SC-002)", async ({
  page,
}) => {
  // Cancel the Supabase top-level navigation with 204 No Content: Chromium keeps
  // the current document, so the page stays on /login in loading state and the
  // DOM stays readable. A route that never settles leaves the navigation pending
  // and blocks page.evaluate, so it cannot be used here.
  await page.route("**/auth/v1/authorize**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  await page.goto(LOGIN_PATH);
  await expect(loginButton(page)).toBeEnabled();

  const [authorizeRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes("/auth/v1/authorize")),
    loginButton(page).click(),
  ]);

  const authorizeUrl = new URL(authorizeRequest.url());
  expect(authorizeUrl.searchParams.get("provider")).toBe("google");
  expect(authorizeUrl.searchParams.get("redirect_to")).toBe(REDIRECT_TO);
  expect(authorizeUrl.searchParams.get("code_challenge")).toBeTruthy();

  await expect(loginButton(page)).toHaveAttribute("aria-busy", "true");
  await expect(loginButton(page)).toBeDisabled();
});

test("callback without a code or with an error redirects to /login?error=auth_failed (US002)", async ({
  request,
}) => {
  for (const path of ["/auth/callback", "/auth/callback?error=access_denied"]) {
    const response = await request.get(path, { maxRedirects: 0 });

    expect(REDIRECT_STATUSES, path).toContain(response.status());
    expect(response.headers()["location"], path).toMatch(
      /\/login\?error=auth_failed$/,
    );
  }
});
