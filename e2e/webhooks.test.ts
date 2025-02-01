import { expect, test } from "@/lib/playwright";
import { getActivities } from "@/lib/db/activities";
import { cleanupSyncs } from "@/lib/db/sync";
import { STRAVA_BASE_URL } from "@/lib/strava";

const WEBHOOK_ENDPOINT = "/api/strava/webhook";
const MOCK_ACTIVITY_ID = 10611571930;

test.describe("subscription", () => {
  test("reject subsciption when using wrong token", async ({ request }) => {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "wrong_token",
      "hub.challenge": "challenge",
    });

    const response = await request.get(`${WEBHOOK_ENDPOINT}?${params}`);

    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
  });

  test("verify challenge", async ({ request }) => {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": process.env.STRAVA_VERIFY_TOKEN,
      "hub.challenge": "challenge",
    });

    const response = await request.get(`${WEBHOOK_ENDPOINT}?${params}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ "hub.challenge": "challenge" });
  });
});

test.describe("handle incoming event", () => {
  test.describe.configure({ mode: "serial" });
  test.use({
    extraHTTPHeaders: { "x-await-event-handling": "true" },
  });

  test.beforeAll(({ testUser }) => cleanupSyncs(testUser.id));
  test.afterAll(({ testUser }) => cleanupSyncs(testUser.id));

  test("handle create event", async ({ request, testUser, page }) => {
    await page.route(STRAVA_BASE_URL, async (route) => {
      const json = [{ name: "Strawberry", id: 21 }];
      await route.fulfill({ json });
    });

    const [before] = await getActivities(testUser.id);

    expect(before).toBeUndefined();

    const response = await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "create",
        event_time: 1623298179,
        object_id: MOCK_ACTIVITY_ID,
        object_type: "activity",
        owner_id: parseInt(testUser.accounts[0].providerAccountId),
        subscription_id: 12345,
        updates: {},
      },
    });

    const [after] = await getActivities(testUser.id);

    expect(after).toMatchObject({
      name: "Lunch Hike",
      private: false,
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("handle update event", async ({ request, testUser }) => {
    const [before] = await getActivities(testUser.id);

    expect(before).toMatchObject({
      name: "Lunch Hike",
      private: false,
    });

    const response = await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "update",
        event_time: 1623298179,
        object_id: MOCK_ACTIVITY_ID,
        object_type: "activity",
        owner_id: parseInt(testUser.accounts[0].providerAccountId),
        subscription_id: 12345,
        updates: {
          title: "new title",
          private: "true",
          visibility: "only_me",
        },
      },
    });

    const [after] = await getActivities(testUser.id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(after).toMatchObject({
      name: "new title",
      private: true,
    });
  });

  test("handle delete event", async ({ request, testUser }) => {
    const [before] = await getActivities(testUser.id);

    expect(before).toMatchObject({
      name: "new title",
      private: true,
    });

    const response = await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "delete",
        event_time: 1705954123,
        object_id: MOCK_ACTIVITY_ID,
        object_type: "activity",
        owner_id: parseInt(testUser.accounts[0].providerAccountId),
        subscription_id: 12345,
      },
    });

    const [after] = await getActivities(testUser.id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(after).toBeUndefined();
  });
});
