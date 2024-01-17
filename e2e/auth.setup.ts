import { expect, test as setup } from "@playwright/test";
import { AUTH_FILE } from "../playwright.config";

if (!process.env.CI) {
  try {
    setup.use({ storageState: AUTH_FILE });
  } catch {
    // No auth file, so we need to authenticate
  }
}

setup("authenticate", async ({ page }) => {
  setup.slow();

  await page.goto("/");

  if (await page.locator('button[name="User menu"]').isVisible()) {
    // Already logged in
    return;
  }

  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("hello@example.com");
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
