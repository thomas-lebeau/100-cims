import { expect, test } from "@/lib/playwright";
import { cleanupSyncs } from "@/lib/db/sync";

test.beforeAll(({ testUser }) => cleanupSyncs(testUser.id));
test.afterAll(({ testUser }) => cleanupSyncs(testUser.id));

test("imports existing strava activities", async ({ page }) => {
  await page.goto("/settings/strava");

  await expect(page.getByTestId("strava-importer-status")).toContainText(
    "✅ found 1 activities (of 2)"
  );

  await test.step("Upload activities", async () => {
    await page.getByRole("button", { name: "Upload" }).click();
  });

  await test.step("Wait activities to be uploaded", async () => {
    await page.getByRole("button", { name: "Upload" }).waitFor();
  });

  await expect(page.getByTestId("strava-importer-status")).toContainText(
    "✅ found 0 activities (of 0)"
  );
});
