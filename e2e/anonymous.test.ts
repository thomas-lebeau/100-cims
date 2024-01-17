import { expect, test } from "@playwright/test";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test("has a login button", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});
