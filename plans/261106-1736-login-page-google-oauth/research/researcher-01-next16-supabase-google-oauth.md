# Research 01: Next 16 + Supabase SSR + Google OAuth

Verified in local docs/types: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/{proxy,page,route}.md`, `.../04-functions/cookies.md`, `node_modules/@supabase/ssr/{package.json (0.12.7),README.md,dist/module/*.d.ts}`, `supabase/config.toml`. Playwright + Supabase-cloud-docs items = from knowledge, not re-verified (marked UNVERIFIED).
Note: Glob/Bash block `node_modules/**/dist/**`; only Read/Grep with explicit path work.

## 0. Next 16 facts (verified)
- `middleware.ts` deprecated -> `proxy.ts` at project root (same level as `app/`), export `proxy(request)` or default; optional `config.matcher`. Without matcher runs on ALL requests incl. `_next/static`, so exclude statics.
- `cookies()` from `next/headers` is async: `await cookies()`. Set/delete only in Server Function or Route Handler, not during Server Component render.
- `searchParams` / `params` are Promises: `(await searchParams).error`. `PageProps<'/login'>` is a global helper (after typegen), no import; `LayoutProps` likewise.

## 1. Supabase SSR clients
Env: see section 4. Files (all kebab-case, <200 lines):

`lib/supabase/browser-client.ts`
```ts
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
```
`lib/supabase/server-client.ts`
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* called from Server Component: ignore, proxy refreshes */ }
      },
    },
  });
}
```
`setAll(cookiesToSet, headers)` has a 2nd `headers` arg in 0.12.x (cache-control headers; README ignores it for non-CDN cases). Types confirm `getAll`/`setAll` only (no get/set/remove).

Is proxy.ts needed? For the login-only scope: NO. Callback route handler writes session cookies itself. Needed later (todo page) to refresh expiring tokens on navigation, since Server Components cannot write cookies. YAGNI: defer; when added, call `await supabase.auth.getClaims()` in `proxy.ts` (README pattern: createServerClient over request/response cookies, then return response) with matcher `'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'`. Use `getClaims()` (not `getSession()`) for server-side trust checks; `getUser()` also valid.

## 2. Google PKCE flow
Recommend: **client component** calling browser client. Reason: PKCE verifier is stored in a browser cookie by `createBrowserClient`; the `signInWithOAuth` call then redirects the browser to `/auth/v1/authorize`. Simple, no round trip, easiest to E2E (navigation to authorize URL observable). Server action alternative works (returns `data.url` -> `redirect(url)`; verifier cookie set via setAll) but adds complexity for no gain.

`app/login/google-sign-in-button.tsx` ("use client")
```tsx
"use client";
import { createClient } from "@/lib/supabase/browser-client"; // check tsconfig "@/*" alias
export function GoogleSignInButton({ label }: { label: string }) {
  async function onClick() {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) location.assign("/login?error=oauth_start_failed");
  }
  return <button type="button" onClick={onClick}>{label}</button>;
}
```
redirectTo origin: use `location.origin` (browser) so it matches whatever host the user opened. Pitfall: cookies (PKCE verifier) are per-host, so 127.0.0.1 vs localhost mismatch breaks the exchange ("code verifier not found"). Pick ONE dev host (127.0.0.1:3000 = config site_url) and use it everywhere (Playwright baseURL, Google console, browser). Both URLs must be in `additional_redirect_urls` or Supabase falls back to site_url.

`app/auth/callback/route.ts`
```ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server-client";
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const providerError = searchParams.get("error"); // access_denied etc.
  if (providerError || !code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(providerError ?? "missing_code")}`);
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  return NextResponse.redirect(`${origin}/todo`);
}
```
- Behind a proxy/Vercel prod, origin may need `x-forwarded-host`; not needed locally (YAGNI).
- Supabase itself forwards Google errors as `?error=access_denied&error_code=...&error_description=...` to redirectTo (also may arrive in hash for implicit; PKCE uses query). Login page maps `error` -> localized message; never render raw `error_description` unescaped (React escapes anyway). Unknown code -> generic message.
- Do not accept a `next` redirect param without allow-list (open redirect); spec says fixed `/todo`.
- `/todo` page does not exist yet: redirect target 404s until built (flag to planner).

Login page reads error:
```tsx
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams; // string | string[] | undefined
```

## 3. supabase/config.toml
Current file has only `[auth.external.apple]` template (line 326); `additional_redirect_urls = ["https://127.0.0.1:3000"]` (https! wrong scheme for dev). Replace/add:
```toml
additional_redirect_urls = ["http://127.0.0.1:3000/auth/callback", "http://localhost:3000/auth/callback"]

[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = ""            # default http://127.0.0.1:54321/auth/v1/callback
url = ""
skip_nonce_check = true      # config comment: "Required for local sign in with Google auth" (only matters for native ID-token flows; harmless for web redirect flow, keep true locally only)
email_optional = false
```
- Env read by supabase CLI: `supabase/.env` (also shell env). Confirm that `supabase/.env` is gitignored (check .gitignore; do not commit secrets). Restart `supabase stop && supabase start` after config edits.
- Google Cloud console (OAuth client type "Web application"): Authorized redirect URI = `http://127.0.0.1:54321/auth/v1/callback` (Supabase's callback, NOT the Next one). Authorized JS origins optional for redirect flow. Consent screen in Testing mode needs test users added.
- Next callback URLs go in Supabase allow-list only, not in Google.

## 4. Next env vars (`.env.local`, covered by `.env*` gitignore; verify)
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # from `supabase status` (CLI v2.76+/v3: "Publishable key")
```
Legacy `anon` key still accepted by supabase-js as the 2nd arg, but publishable is current naming (@supabase/ssr README uses SUPABASE_PUBLISHABLE_KEY). `config.toml` also has `secret_key` placeholders; never expose secret key to browser. Provide `.env.example` (commit) with blank values.

## 5. Locale without i18n lib (vi|en)
Simplest correct: cookie `NEXT_LOCALE`, read in server component, set by a **Server Action** (cookies().set allowed there; Next re-renders in same roundtrip, so `router.refresh()` unnecessary).
```ts
// lib/i18n/get-locale.ts
import { cookies } from "next/headers";
export type Locale = "vi" | "en";
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("NEXT_LOCALE")?.value;
  return v === "en" ? "en" : "vi"; // default per spec (confirm default)
}
// lib/i18n/set-locale-action.ts
"use server";
import { cookies } from "next/headers";
export async function setLocale(l: "vi" | "en") {
  if (l !== "vi" && l !== "en") return;
  (await cookies()).set("NEXT_LOCALE", l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
```
Client dropdown: `onChange={e => startTransition(() => setLocale(e.target.value))}`. Alternative `document.cookie=...; router.refresh()` also works but needs client-side validation; server action preferred. Dictionary = plain `{vi:{...},en:{...}}` TS object (`lib/i18n/messages.ts`). Also set `<html lang={locale}>` in `app/layout.tsx` (make it async; reading cookies makes the layout dynamic: acceptable; Cache Components not enabled by default - check next.config.ts, if `cacheComponents` on, wrap in Suspense).
Pitfall: error banner text must be translated too.

## 6. Playwright (UNVERIFIED vs current docs; standard API)
`npm i -D @playwright/test && npx playwright install chromium` (browser download; Windows OK, needs network; run from repo path w/o special chars; ok).
`playwright.config.ts`
```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: { command: "npm run dev -- -H 127.0.0.1 -p 3000", url: "http://127.0.0.1:3000/login",
               reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
```
Env vars for dev server come from `.env.local` automatically. Windows: `npm run dev -- -H 127.0.0.1` fine in PowerShell/Git Bash; avoid `KEY=val cmd` inline env syntax (use `cross-env` or config `webServer.env`); webServer kill on Windows may leave orphan node: use `reuseExistingServer`.

Click -> authorize URL without Google (stub the Supabase hop, no local Supabase even needed):
```ts
test("google button goes to supabase authorize", async ({ page }) => {
  await page.route("**/auth/v1/authorize**", r => r.fulfill({ status: 200, body: "stub" }));
  await page.goto("/login");
  const [req] = await Promise.all([
    page.waitForRequest(r => r.url().includes("/auth/v1/authorize")),
    page.getByRole("button", { name: /google/i }).click(),
  ]);
  const u = new URL(req.url());
  expect(u.origin).toBe("http://127.0.0.1:54321");
  expect(u.searchParams.get("provider")).toBe("google");
  expect(u.searchParams.get("redirect_to")).toBe("http://127.0.0.1:3000/auth/callback");
  expect(u.searchParams.get("code_challenge")).toBeTruthy(); // PKCE
});
```
Route stub is a top-level navigation, `page.route` intercepts navigations; fine. Error banner: `await page.goto("/login?error=access_denied"); await expect(page.getByRole("alert")).toBeVisible();` Callback unit-ish E2E: `request.get("/auth/callback?error=access_denied", {maxRedirects:0})` -> 307 with `location` ending `/login?error=access_denied`. Locale: `context.addCookies([{name:"NEXT_LOCALE",value:"en",url:"http://127.0.0.1:3000"}])`, then assert text; dropdown test: select, assert text changes.
Full real-Google login E2E is not feasible (Google bot detection); out of scope.

## Ranked call
1. Client-component OAuth + route-handler callback + server-action locale; no proxy.ts yet. (simplest, matches PKCE)
2. Server-action OAuth: more moving parts, no benefit.
3. Add proxy.ts now: premature until a protected page exists.

## Unresolved
- tsconfig `@/*` alias existence; `.gitignore` coverage of `.env*` and `supabase/.env` (not checked).
- `cacheComponents` setting in next.config.ts (affects cookies() in layout).
- Default locale (vi assumed), `/todo` page absence, Playwright docs not re-verified.
- Exact CLI v3 key output label/env name (publishable vs anon) not verified locally.

**Status:** DONE_WITH_CONCERNS
