import { expect, test } from "@playwright/test";

test("has user menu", async ({ page }) => {
  await page.goto("/");

  await page.locator('button[name="User menu"]').click();

  await expect(page.getByText("hello@example.com")).toBeVisible();
});
