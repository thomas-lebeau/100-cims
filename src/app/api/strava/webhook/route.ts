import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { Account, getAccountIdByStravaId } from "@/lib/db/accounts";
import { stravaActivitySchema } from "@/lib/db/activities";
import { addAscents } from "@/lib/db/ascent";
import { getTinyCims } from "@/lib/db/cims";
import { addSync } from "@/lib/db/sync";
import { getCimForPolyline } from "@/lib/geojson";
import { maybeRefreshToken } from "@/lib/next-auth";
import { STRAVA_BASE_URL } from "@/lib/strava";
import zfetch from "@/lib/zfetch";
import { serializeError } from "serialize-error";

const eventBodySchema = z.object({
  aspect_type: z.union([
    z.literal("create"),
    z.literal("update"),
    z.literal("delete"),
  ]),
  event_time: z.number(),
  object_id: z.number(),
  object_type: z.union([z.literal("activity"), z.literal("athlete")]),
  owner_id: z.number().transform((id) => id.toString()),
  subscription_id: z.number(),
});

type WebhookEvent = z.infer<typeof eventBodySchema>;

/* eslint-disable no-console */
async function handleEvent(req: NextRequest) {
  try {
    const safeBody = eventBodySchema.safeParse(await req.json());

    if (!safeBody.success) {
      console.error("[handleEvent]", safeBody.error.issues);

      return;
    }

    const event = safeBody.data;

    // TODO: handle athlete events?
    if (event.object_type !== "activity") return;

    // TODO: should this use the strava app admin token instead?
    const account = await getAccountIdByStravaId(event.owner_id);

    if (!account) {
      console.log("[handleEvent]", "No account found", event.owner_id);
      return;
    }

    await maybeRefreshToken(account);

    if (event.aspect_type === "create") {
      const data = await handleCreateActivityEvent(account, event);
      console.log("[handleCreateActivityEvent]", data);

      return;
    }

    if (event.aspect_type === "update") {
      const data = await handleUpadeActivityEvent(account, event);
      console.log("[handleUpadeActivityEvent]", data);

      return;
    }

    if (event.aspect_type === "delete") {
      const data = await handleDeleteActivityEvent(account, event);
      console.log("[handleDeleteActivityEvent]", data);

      return;
    }

    console.error("[handleEvent]", "Unknown event_type", event.aspect_type);
  } catch (error) {
    console.error("[handleEvent]", serializeError(error));
  }
}
/* eslint-enable */

async function handleUpadeActivityEvent(account: Account, event: WebhookEvent) {
  return ["TODO: Implement", event];
}

async function handleDeleteActivityEvent(
  account: Account,
  event: WebhookEvent
) {
  return ["TODO: Implement", event];
}

async function handleCreateActivityEvent(
  account: Account,
  event: WebhookEvent
) {
  const activity = await zfetch(
    stravaActivitySchema,
    `${STRAVA_BASE_URL}/activities/${event.object_id}`,
    {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
      },
    }
  );

  const cims = await getTinyCims();
  const cimIds = getCimForPolyline(cims, activity.summaryPolyline);

  if (cimIds.length === 0) {
    return ["no cims found", event];
  }

  const syncedData = await addSync(account.userId, [activity]);

  const activityId = syncedData.activities[0]?.id;

  if (!activityId) {
    return ["no activity created", event];
  }

  const ascendedData = await addAscents(
    account.userId,
    cimIds.map((cimId) => ({ cimId, activityId }))
  );

  return [syncedData, ascendedData];
}

export async function POST(req: NextRequest) {
  handleEvent(req);

  return NextResponse.json({ ok: true }, { status: 200 });
}

const urlSearchParamsSchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const safeUrlSearchParams = urlSearchParamsSchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    );

    if (!safeUrlSearchParams.success) {
      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    if (
      safeUrlSearchParams.data["hub.verify_token"] !==
      process.env.STRAVA_VERIFY_TOKEN
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { "hub.challenge": safeUrlSearchParams.data["hub.challenge"] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
