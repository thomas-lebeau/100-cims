import { NextRequest, NextResponse } from "next/server";

import getServerSession from "@/lib/get-server-session";
import prisma from "@/lib/prisma";
import serverTimings from "@/lib/server-timings";

import { stravaActivitySchema } from "@/lib/db/activities";
import { serializeError } from "serialize-error";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    page: z.string(),
  }),
});

const urlSearchParamsSchema = z.object({
  since: z
    .string()
    .transform((date) => new Date(date)?.getTime() / 1000)
    .transform((date) => Math.ceil(date))
    .optional(),
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

    const pageId = safeContext.data.params.page ?? 1;

    const safeUrlSearchParams = urlSearchParamsSchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    );

    if (!safeUrlSearchParams.success) {
      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    // `after=` used to fetch the oldest page first
    let url = `https://www.strava.com/api/v3/athlete/activities?page=${pageId}&after=`;

    if (safeUrlSearchParams.data.since) {
      url += `${safeUrlSearchParams.data.since}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await res.json();

    const safeActivity = stravaActivitySchema.array().safeParse(data);

    if (!safeActivity.success) {
      return NextResponse.json(safeActivity.error.issues, { status: 422 }); //TODO: return [] or different error code
    }

    serverTiming.stop("get");

    return NextResponse.json(safeActivity.data, {
      status: 200,
      headers: serverTiming.headers(),
    });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
