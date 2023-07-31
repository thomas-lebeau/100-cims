import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import serverTimings from "@/lib/server-timings";
import getServerSession from "@/lib/get-server-session";

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
    const result = routeContextSchema.safeParse(context);

    if (!result.success) {
      return NextResponse.json(result.error.issues, { status: 422 });
    }

    const id = result.data.params.id;
    const serverTiming = new serverTimings();
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: serverTiming.headers() }
      );
    }

    serverTiming.start("usr");

    let data;

    if (req.method === "PUT") {
      data = await prisma.cimToUser.create({
        data: {
          cimId: id,
          userId: session.user.id,
        },
      });
    } else {
      data = await prisma.cimToUser.deleteMany({
        where: {
          cimId: id,
          userId: session.user.id,
        },
      });
    }

    serverTiming.stop("usr");

    return NextResponse.json(data, {
      status: 200,
      headers: serverTiming.headers(),
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
export const PUT = handler;
export const DELETE = handler;
