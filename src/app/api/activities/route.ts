import { getActivities } from "@/lib/db/activities";
import getServerSession from "@/lib/get-server-session";
import { NextRequest, NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { z } from "zod";

const originTypeQueryParamSchema = z
  .union([z.literal("STRAVA"), z.literal("GPX")])
  .nullable();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const originType = originTypeQueryParamSchema.safeParse(
      new URL(req.url).searchParams.get("originType")
    );

    if (!originType.success) {
      return NextResponse.json(originType.error.issues, { status: 422 });
    }

    const data = await getActivities(session.user.id, originType.data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
