import { getCims } from "@/lib/db/cims";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";

export async function GET() {
  try {
    const data = await getCims();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
