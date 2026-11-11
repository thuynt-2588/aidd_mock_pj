import { defineConfig, devices } from "@playwright/test";

// E2E_BASE_URL targets an already-running server (e.g. a `next start` with a
// future NEXT_PUBLIC_SITE_OPEN_AT for the prelaunch lock); no dev server then.
const EXTERNAL_BASE_URL = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: EXTERNAL_BASE_URL ? undefined : {
    command: "npm run dev -- -H 127.0.0.1 -p 3000",
    // Readiness probe hits /login: "/" is auth-guarded and redirects.
    url: `${BASE_URL}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
