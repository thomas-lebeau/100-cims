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
  test.describe.configure({ mode: "serial" });
  test.use({
    extraHTTPHeaders: { "x-await-event-handling": "true" },
  });

  test.beforeAll(cleanupSyncs);
  test.afterAll(cleanupSyncs);

  test("handle create event", async ({ request }) => {
    const [before] = await getActivities(USER.userId);

    expect(before).toBeUndefined();

    const response = await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "create",
        event_time: 1623298179,
        object_id: USER.activityId,
        object_type: "activity",
        owner_id: USER.stravaAccountId,
        subscription_id: 1,
        updates: {},
      },
    });

    const [after] = await getActivities(USER.userId);

    expect(after).toMatchObject({
      name: "Some Hike",
      private: false,
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("handle update event", async ({ request }) => {
    const [before] = await getActivities(USER.userId);

    expect(before).toMatchObject({
      name: "Some Hike",
      private: false,
    });

    const response = await request.post(WEBHOOK_ENDPOINT, {
      data: {
        aspect_type: "update",
        event_time: 1623298179,
        object_id: USER.activityId,
        object_type: "activity",
        owner_id: USER.stravaAccountId,
        subscription_id: 1,
        updates: {
          title: "new title",
          private: "true",
          visibility: "only_me",
        },
      },
    });

    const [after] = await getActivities(USER.userId);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(after).toMatchObject({
      name: "new title",
      private: true,
    });
  });
});

function cleanupSyncs() {
  return prisma.sync.deleteMany({
    where: {
      userId: USER.userId,
    },
  });
}
