import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/next-auth";
import serverTimings from "@/lib/server-timings";

import { getAccount } from "@/lib/db/accounts";
import { stravaActivitySchema } from "@/lib/db/activities";
import { STRAVA_BASE_URL } from "@/lib/strava";
import { serializeError } from "serialize-error";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.promise(
    z.object({
      page: z.string(),
    })
  ),
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
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: serverTiming.headers() }
      );
    }

    serverTiming.start("get");

    const safeContext = routeContextSchema.safeParse(context);

    if (!safeContext.success) {
      return NextResponse.json(safeContext.error.issues, { status: 422 });
    }

    const pageId = (await safeContext.data.params).page ?? 1;

    const safeUrlSearchParams = urlSearchParamsSchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    );

    if (!safeUrlSearchParams.success) {
      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    // `after=` used to fetch the oldest page first
    let url = `${STRAVA_BASE_URL}/athlete/activities?page=${pageId}&after=`;

    if (safeUrlSearchParams.data.since) {
      url += `${safeUrlSearchParams.data.since}`;
    }

    const [{ access_token }] = await getAccount(session.user.id, "strava");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch strava activities. ${res.statusText}`,
        },
        { status: res.status }
      );
    }

    const safeActivity = stravaActivitySchema
      .array()
      .safeParse(await res.json());

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
