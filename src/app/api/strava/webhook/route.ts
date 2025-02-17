import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { Account, getAccountIdByStravaId } from "@/lib/db/accounts";
import {
  ActivityInput,
  deleteStravaActivity,
  stravaActivitySchema,
  updateStravaActivity,
} from "@/lib/db/activities";
import { addAscents } from "@/lib/db/ascent";
import { getTinyCims } from "@/lib/db/cims";
import { addSync } from "@/lib/db/sync";
import { getCimForPolyline } from "@/lib/geojson";
import { maybeRefreshToken } from "@/lib/next-auth";
import { STRAVA_BASE_URL } from "@/lib/strava";
import zfetch from "@/lib/zfetch";
import { serializeError } from "serialize-error";
import { createLogger } from "@/lib/logger";

const logger = createLogger("strava-webhook");

const eventBodySchema = z.object({
  aspect_type: z.union([
    z.literal("create"),
    z.literal("update"),
    z.literal("delete"),
  ]),
  event_time: z.number(),
  object_id: z.number().transform((id) => id.toString()),
  object_type: z.union([z.literal("activity"), z.literal("athlete")]),
  owner_id: z.number().transform((id) => id.toString()),
  subscription_id: z.number(),
  updates: z
    .object({
      title: z.string().optional(),
      type: z.string().optional(),
      private: z
        .enum(["true", "false"])
        .transform((value) =>
          value === "true" ? true : value === "false" ? false : value
        )
        .optional(),
      visibility: z.enum(["everyone", "followers_only", "only_me"]).optional(),
    })
    .optional(),
});

type WebhookEvent = z.infer<typeof eventBodySchema>;

async function handleEvent(req: NextRequest) {
  try {
    const safeBody = eventBodySchema.safeParse(await req.json());

    if (!safeBody.success) {
      logger.error("Invalid event body", safeBody.error.issues);

      return;
    }

    const event = safeBody.data;

    if (
      event.subscription_id !== parseInt(process.env.STRAVA_SUBSCRIPTION_ID)
    ) {
      logger.error("Unknown subscription_id");

      return;
    }

    // TODO: handle athlete events?
    if (event.object_type !== "activity") {
      logger.info("Unknown object_type", { object_type: event.object_type });

      return;
    }

    // TODO: should this use the strava app admin token instead?
    const account = await getAccountIdByStravaId(event.owner_id);

    if (!account) {
      logger.error("No account found");

      return;
    }

    await maybeRefreshToken(account);

    switch (event.aspect_type) {
      case "create":
        return await handleCreateActivityEvent(account, event);
      case "update":
        return await handleUpadeActivityEvent(account, event);
      case "delete":
        return await handleDeleteActivityEvent(account, event);
      default:
        logger.error("Unknown event_type", { event_type: event.aspect_type });
    }
  } catch (error) {
    logger.error("Unknown error", serializeError(error));
  }
}

async function handleUpadeActivityEvent(account: Account, event: WebhookEvent) {
  const updates: Partial<
    Pick<ActivityInput, "private" | "name" | "sportType">
  > = {};

  if (
    event.updates?.visibility === "only_me" ||
    event.updates?.visibility === "followers_only"
  ) {
    updates.private = true;
  } else if (event.updates?.visibility === "everyone") {
    updates.private = false;
  }

  if (event.updates?.title) {
    updates.name = event.updates.title;
  }

  if (event.updates?.type) {
    updates.sportType = event.updates.type;
  }

  const updatedActivity = await updateStravaActivity(
    account.userId,
    event.object_id,
    updates
  );

  if (!updatedActivity) {
    logger.error("No activity updated", { userId: account.userId });

    return;
  }

  logger.info("Activity updated", { userId: account.userId });
}

async function handleDeleteActivityEvent(
  account: Account,
  event: WebhookEvent
) {
  const deletedActivity = await deleteStravaActivity(
    account.userId,
    event.object_id
  );

  if (!deletedActivity) {
    logger.error("No activity deleted", { userId: account.userId });

    return;
  }

  logger.info("Activity deleted", { userId: account.userId });
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
    logger.info("No cims found", { userId: account.userId });

    return;
  }

  const syncedData = await addSync("STRAVA_WEBHOOK", account.userId, [
    activity,
  ]);

  const activityId = syncedData.activities[0]?.id;

  if (!activityId) {
    logger.error("No activity created", { userId: account.userId });

    return;
  }

  const ascents = await addAscents(
    account.userId,
    cimIds.map((cimId) => ({ cimId, activityId }))
  );

  if (ascents.count === 0) {
    logger.error("No ascents created", { userId: account.userId });

    return;
  }

  logger.info("Activity created", {
    userId: account.userId,
    ascentsCount: ascents.count,
    activityId,
  });
}

export async function POST(req: NextRequest) {
  const awaitEventHandling = req.headers.get("x-await-event-handling");

  // Make webhook handling synchronous for testing
  //
  // The subscription callback endpoint must acknowledge the POST of each new
  // event with a status code of 200 OK within two seconds. Event pushes are
  // retried (up to a total of three attempts) if a 200 is not returned.
  // If your application needs to do more processing of the received information,
  // it should do so asynchronously.
  if (awaitEventHandling === "true") {
    await handleEvent(req);
    logger.end();
  } else {
    waitUntil(handleEvent(req).then(() => logger.end()));
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

const urlSearchParamsSchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

export async function GET(req: NextRequest) {
  const logger = createLogger("strava-webhook-subscription");
  try {
    const safeUrlSearchParams = urlSearchParamsSchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    );

    if (!safeUrlSearchParams.success) {
      logger.error(
        "Invalid url search params",
        safeUrlSearchParams.error.issues
      );
      logger.end();

      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    if (
      safeUrlSearchParams.data["hub.verify_token"] !==
      process.env.STRAVA_VERIFY_TOKEN
    ) {
      logger.error("Invalid verify token", {
        verifyToken: safeUrlSearchParams.data["hub.verify_token"],
      });
      logger.end();

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    logger.info("Valid verify token");
    logger.end();

    return NextResponse.json(
      { "hub.challenge": safeUrlSearchParams.data["hub.challenge"] },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Unknown error", serializeError(error));

    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
