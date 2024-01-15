import {
  cleanupExpiredSessions,
  cleanupExpiredVerificationTokens,
} from "@/lib/db/cron";
import { NextRequest, NextResponse } from "next/server";
import { serializeError } from "serialize-error";

export async function GET(req: NextRequest) {
  try {
    if (
      req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await cleanupExpiredSessions();
    await cleanupExpiredVerificationTokens();

    return NextResponse.json(["done!"], { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
