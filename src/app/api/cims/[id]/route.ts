import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import serverTimings from "@/lib/server-timings";
import getServerSession from "@/lib/get-server-session";
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

    const cimId = safeContext.data.params.id;
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

    if (req.method === "PUT") {
      data = await prisma.cimToUser.create({
        data: {
          cimId: cimId,
          userId: session.user.id,
        },
      });
    } else {
      data = await prisma.cimToUser.deleteMany({
        where: {
          cimId: cimId,
          userId: session.user.id,
        },
      });
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
