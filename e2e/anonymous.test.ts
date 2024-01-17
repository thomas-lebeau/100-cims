import { expect, test } from "@playwright/test";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has a login button", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});

test("has no ascentions", async ({ page }) => {
  await page.getByRole("tab", { name: "Ascended" }).click();
  await expect(page.getByRole("cell", { name: "No results." })).toBeVisible();
});
