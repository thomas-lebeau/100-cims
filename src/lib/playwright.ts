import { test as base } from "@playwright/test";
import { getUser } from "./db/users";

export { expect } from "@playwright/test";

export const TEST_USER_EMAIL = "hello@e2e.com";

export const test = base.extend<{
  testUser: NonNullable<Awaited<ReturnType<typeof getUser>>>;
}>({
  testUser: async ({}, use) => {
    const testUser = await getUser(TEST_USER_EMAIL);

    if (!testUser) {
      throw new Error(`User with email ${TEST_USER_EMAIL} not found`);
    }

    await use(testUser);
  },
});
