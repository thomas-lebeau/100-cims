import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
  owner_id: z.number(),
  subscription_id: z.number(),
});

type WebhookEvent = z.infer<typeof eventBodySchema>;

async function handleActivityEvent(event: WebhookEvent) {
  console.log("handleActivityEvent", event);
}

export async function POST(req: NextRequest) {
  try {
    const safeBody = eventBodySchema.safeParse(await req.json());

    if (!safeBody.success) {
      return NextResponse.json(safeBody.error.issues, { status: 422 });
    }

    handleActivityEvent(safeBody.data);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
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
