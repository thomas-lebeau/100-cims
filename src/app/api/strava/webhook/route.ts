import type { NextRequest } from "next/server";
import { NextResponse, after } from "next/server";
import { z } from "zod";

import type { Account } from "@/lib/db/accounts";
import { getAccountIdByStravaId } from "@/lib/db/accounts";
import type { ActivityInput } from "@/lib/db/activities";
import { deleteStravaActivity, stravaActivitySchema, updateStravaActivity } from "@/lib/db/activities";
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
  aspect_type: z.union([z.literal("create"), z.literal("update"), z.literal("delete")]),
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
        .transform((value) => (value === "true" ? true : value === "false" ? false : value))
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
      after(logger.error("Invalid event body", safeBody.error.issues));

      return;
    }

    const event = safeBody.data;

    if (event.subscription_id !== parseInt(process.env.STRAVA_SUBSCRIPTION_ID)) {
      after(logger.error("Unknown subscription_id"));

      return;
    }

    // TODO: handle athlete events?
    if (event.object_type !== "activity") {
      after(logger.info("Unknown object_type", { object_type: event.object_type }));

      return;
    }

    // TODO: should this use the strava app admin token instead?
    const account = await getAccountIdByStravaId(event.owner_id);

    if (!account) {
      after(logger.error("No account found"));

      return;
    }

    try {
      await maybeRefreshToken(account);
    } catch (error) {
      after(
        logger.error("Failed to refresh token", serializeError(error), {
          userId: account.userId,
          accountId: account.id,
        })
      );

      return;
    }

    switch (event.aspect_type) {
      case "create":
        return await handleCreateActivityEvent(account, event);
      case "update":
        return await handleUpadeActivityEvent(account, event);
      case "delete":
        return await handleDeleteActivityEvent(account, event);
      default:
        after(logger.error("Unknown event_type", { event_type: event.aspect_type }));
    }
  } catch (error) {
    after(logger.error("Unknown error", serializeError(error)));
  }
}

async function handleUpadeActivityEvent(account: Account, event: WebhookEvent) {
  const updates: Partial<Pick<ActivityInput, "private" | "name" | "sportType">> = {};

  if (event.updates?.visibility === "only_me" || event.updates?.visibility === "followers_only") {
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

  const updatedActivity = await updateStravaActivity(account.userId, event.object_id, updates);

  if (!updatedActivity) {
    after(logger.info("No activity updated", { userId: account.userId }));

    return;
  }

  after(logger.info("Activity updated", { userId: account.userId }));
}

async function handleDeleteActivityEvent(account: Account, event: WebhookEvent) {
  const deletedActivity = await deleteStravaActivity(account.userId, event.object_id);

  if (!deletedActivity) {
    after(logger.info("No activity deleted", { userId: account.userId }));

    return;
  }

  after(logger.info("Activity deleted", { userId: account.userId }));
}

async function handleCreateActivityEvent(account: Account, event: WebhookEvent) {
  const activity = await zfetch(stravaActivitySchema, `${STRAVA_BASE_URL}/activities/${event.object_id}`, {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
    },
  }).catch((err) => {
    after(logger.error("Failed to fetch activity", serializeError(err)));

    return;
  });

  if (!activity) {
    after(
      logger.error("No activity found", {
        userId: account.userId,
        objectId: event.object_id,
      })
    );

    return;
  }

  const cims = await getTinyCims();
  const cimIds = getCimForPolyline(cims, activity.summaryPolyline);

  if (cimIds.length === 0) {
    after(
      logger.info("No cims found", {
        userId: account.userId,
        objectId: event.object_id,
      })
    );

    return;
  }

  const syncedData = await addSync("STRAVA_WEBHOOK", account.userId, [activity]);

  const activityId = syncedData.activities[0]?.id;

  if (!activityId) {
    after(logger.error("No activity created", { userId: account.userId }));

    return;
  }

  const ascents = await addAscents(
    account.userId,
    cimIds.map((cimId) => ({ cimId, activityId }))
  );

  if (ascents.count === 0) {
    after(logger.error("No ascents created", { userId: account.userId }));

    return;
  }

  after(
    logger.info("Activity created", {
      userId: account.userId,
      ascentsCount: ascents.count,
      activityId,
    })
  );
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
  } else {
    after(handleEvent(req));
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
      after(logger.error("Invalid url search params", safeUrlSearchParams.error.issues));

      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    if (safeUrlSearchParams.data["hub.verify_token"] !== process.env.STRAVA_VERIFY_TOKEN) {
      after(
        logger.error("Invalid verify token", {
          verifyToken: safeUrlSearchParams.data["hub.verify_token"],
        })
      );

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    after(logger.info("Valid verify token"));

    return NextResponse.json({ "hub.challenge": safeUrlSearchParams.data["hub.challenge"] }, { status: 200 });
  } catch (error) {
    after(logger.error("Unknown error", serializeError(error)));

    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
