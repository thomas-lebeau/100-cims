import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { activityInputSchema } from "@/lib/db/activities";
import { AscentInput, addAscents } from "@/lib/db/ascent";
import { addSync, getLastSync } from "@/lib/db/sync";
import { auth } from "@/lib/next-auth";
import serverTimings from "@/lib/server-timings";
import { serializeError } from "serialize-error";

const bodySchema = z.array(
  z.object({
    cimIds: z.string().array().nonempty(),
    activity: activityInputSchema,
  })
);

export async function POST(req: NextRequest) {
  try {
    const serverTiming = new serverTimings();
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: serverTiming.headers() }
      );
    }

    serverTiming.start("db");

    const safeBody = bodySchema.safeParse(await req.json());

    if (!safeBody.success) {
      return NextResponse.json(safeBody.error.issues, { status: 422 });
    }

    const syncedData = await addSync(
      "STRAVA_IMPORT",
      session.user.id,
      safeBody.data.map(({ activity }) => activity)
    );

    const ascents = safeBody.data.reduce(
      (acc: AscentInput[], { cimIds, activity }) => {
        const syncedActivity = syncedData.activities.find(
          ({ originId }) => originId === activity.originId
        );

        if (!syncedActivity) return acc;

        return acc.concat(
          cimIds.map((cimId) => ({
            cimId,
            activityId: syncedActivity.id,
          }))
        );
      },
      []
    );

    const ascendedData = await addAscents(session.user.id, ascents);

    serverTiming.stop("db");

    return NextResponse.json([syncedData, ascendedData], {
      status: 200,
      headers: serverTiming.headers(),
    });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getLastSync(session.user.id);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
