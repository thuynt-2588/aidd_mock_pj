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
    // Readiness probe hits "/" (200 today). Probing /login would never pass
    // before the screen exists, so the RED run could not reach assertions.
    url: `${BASE_URL}/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
