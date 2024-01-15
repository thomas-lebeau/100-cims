import { getComarcas } from "@/lib/db/comarcas";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";

export async function GET() {
  try {
    const data = await getComarcas();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
