import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { addAscent, deleteAscent } from "@/lib/db/ascent";
import getServerSession from "@/lib/get-server-session";
import serverTimings from "@/lib/server-timings";
import { serializeError } from "serialize-error";

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

async function handler(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const safeContext = routeContextSchema.safeParse(context);

    if (!safeContext.success) {
      return NextResponse.json(safeContext.error.issues, { status: 422 });
    }

    const id = safeContext.data.params.id;
    const serverTiming = new serverTimings();
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: serverTiming.headers() }
      );
    }

    serverTiming.start("db");

    let data;

    switch (req.method) {
      case "PUT":
        data = await addAscent(session.user.id, id);
        break;

      case "DELETE":
        data = await deleteAscent(session.user.id, id);
        break;

      default:
        return NextResponse.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
    }

    serverTiming.stop("db");

    return NextResponse.json(data, {
      status: 200,
      headers: serverTiming.headers(),
    });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
export const PUT = handler;
export const DELETE = handler;
