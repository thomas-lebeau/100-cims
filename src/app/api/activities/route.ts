import { getActivities } from "@/lib/db/activities";
import getServerSession from "@/lib/get-server-session";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getActivities(session.user.id);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
