import { NextRequest, NextResponse } from "next/server";

import getServerSession from "@/lib/get-server-session";
import prisma from "@/lib/prisma";
import serverTimings from "@/lib/server-timings";

import { stravaActivitySchema } from "@/types/strava";
import { serializeError } from "serialize-error";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export async function GET(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const serverTiming = new serverTimings();
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: serverTiming.headers() }
      );
    }

    serverTiming.start("auth");

    const { access_token } = await prisma.account.findFirstOrThrow({
      where: {
        userId: session.user.id,
        provider: "strava",
      },
      select: {
        access_token: true,
      },
    });

    serverTiming.stop("auth");
    serverTiming.start("get");

    const safeContext = routeContextSchema.safeParse(context);

    if (!safeContext.success) {
      return NextResponse.json(safeContext.error.issues, { status: 422 });
    }

    const pageId = safeContext.data.params.id ?? 1;

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${pageId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data = await res.json();

    const safeActivity = stravaActivitySchema.array().safeParse(data);

    if (!safeActivity.success) {
      return NextResponse.json(safeActivity.error.issues, { status: 422 });
    }

    serverTiming.stop("get");
    serverTiming.start("map");

    return NextResponse.json(safeActivity.data, {
      status: 200,
      headers: serverTiming.headers(),
    });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
