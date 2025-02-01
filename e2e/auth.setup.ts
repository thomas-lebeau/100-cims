import { BrowserContextOptions, expect, test as setup } from "@playwright/test";
import fs from "fs";
import { AUTH_FILE } from "../playwright.config";
import { TEST_USER_EMAIL } from "@/lib/playwright";

type StorageState = BrowserContextOptions["storageState"];

if (!process.env.CI) {
  // read auth file if it exists. This allows us to run tests locally without
  // having to authenticate every time
  setup.use({
    // eslint-disable-next-line no-empty-pattern
    storageState: async ({}, use) => {
      try {
        const authFile = fs.readFileSync(AUTH_FILE, "utf-8");

        return use(JSON.parse(authFile) as StorageState);
      } catch {
        // No auth file, so we will need to authenticate
        return use(undefined);
      }
    },
  });
}

setup("authenticate", async ({ page }) => {
  await page.goto("/");

  if (await page.locator('button[name="User menu"]').isVisible()) {
    // Already logged in
    return;
  }

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(TEST_USER_EMAIL);
  await page.getByRole("button", { name: "Sign in with Email" }).click();
  await page.goto("https://ethereal.email/login");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(process.env.EMAIL_SERVER_USER);
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(process.env.EMAIL_SERVER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.goto("https://ethereal.email/messages");
  await page
    .getByRole("link", { name: /Sign in to/ })
    .first()
    .click();
  await page
    .frameLocator("#message iframe")
    .getByRole("link", { name: "Sign in" })
    .click();

  await expect(page.locator('button[name="User menu"]')).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
