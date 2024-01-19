import { expect, test } from "@playwright/test";
import { USER } from "./test-users";

test("has user menu", async ({ page }) => {
  await page.goto("/");

  await page.locator('button[name="User menu"]').click();

  await expect(page.getByText(USER.email)).toBeVisible();
});
