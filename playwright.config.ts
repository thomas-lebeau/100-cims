import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export const AUTH_FILE = "playwright/.auth/user.json";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [["html", { attachmentsBaseURL: process.env.PLAYWRIGHT_REPORT_PATH }]]
    : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL,
    trace: isCI ? "on-first-retry" : "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
  ],
});
