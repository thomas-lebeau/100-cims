import { getActivities } from "@/lib/db/activities";
import { prisma } from "@/lib/prisma";
import { expect, test } from "playwright/test";
import { USER } from "./test-users";

const WEBHOOK_ENDPOINT = "/api/strava/webhook";

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
  function cleanupSyncs() {
    return prisma.sync.deleteMany({
      where: {
        userId: "clrgyxhx00000ereeuwlk42yq",
      },
    });
  }

  test.beforeAll(cleanupSyncs);
  test.afterAll(cleanupSyncs);

  test("respond with 200 to incoming event", async ({ request }) => {
    const response = await request.post(WEBHOOK_ENDPOINT);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("handle event", async ({ request }) => {
    const before = await getActivities("clrgyxhx00000ereeuwlk42yq");

    expect(before.length).toBe(0);

    await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "create",
        event_time: 1623298179,
        object_id: 10568058092, // https://www.strava.com/activities/10568058092
        object_type: "activity",
        owner_id: USER.stravaAccountId,
        subscription_id: 1,
        updates: {},
      },
      headers: {
        "x-await-event-handling": "true",
      },
    });

    const after = await getActivities("clrgyxhx00000ereeuwlk42yq");
    expect(after.length).toBe(1);
  });
});
