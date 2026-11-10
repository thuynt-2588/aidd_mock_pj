import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:3000";

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
  webServer: {
    command: "npm run dev -- -H 127.0.0.1 -p 3000",
    // Readiness probe hits /login: "/" is auth-guarded and redirects.
    url: `${BASE_URL}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
