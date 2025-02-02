import { expect, test } from "@/lib/playwright";

test("has user menu", async ({ page, testUser }) => {
  await page.goto("/");

  await page.locator('button[name="User menu"]').click();

  await expect(page.getByText(testUser.email)).toBeVisible();
});

test("Can filter by comarca", async ({ page }) => {
  await page.goto("/");

  await page
    .locator("div")
    .filter({ hasText: /^AllEssentialsAllAscendedComarca$/ })
    .getByRole("button")
    .click();

  await page.getByRole("option", { name: "Alt Penedès" }).click();

  await expect(page.getByRole("complementary")).toContainText("Alt Penedès");

  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await expect(page.getByRole("complementary")).toContainText("Comarca");
});
