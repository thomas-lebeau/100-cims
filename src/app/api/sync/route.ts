import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { activityInputSchema } from "@/lib/db/activities";
import { addAscent } from "@/lib/db/ascent";
import { addSync } from "@/lib/db/sync";
import getServerSession from "@/lib/get-server-session";
import serverTimings from "@/lib/server-timings";
import { serializeError } from "serialize-error";

const bodySchema = z.object({
  cimIds: z.string().array().nonempty(),
  activity: activityInputSchema,
});

export async function POST(req: NextRequest) {
  try {
    const serverTiming = new serverTimings();
    const session = await getServerSession();

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

    const syncData = await addSync(session.user.id, [safeBody.data.activity]);
    const activityId = syncData.activities[0].id;

    const ascentData = [];

    for (const cimId of safeBody.data.cimIds) {
      ascentData.push(await addAscent(session.user.id, cimId, activityId));
    }

    serverTiming.stop("db");

    return NextResponse.json(
      { syncData, ascentData },
      {
        status: 200,
        headers: serverTiming.headers(),
      }
    );
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
