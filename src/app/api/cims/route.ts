import { getCims } from "@/lib/db/cims";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { z } from "zod";

const urlSearchParamsSchema = z.object({
  includeComarcas: z
    .string()
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

export async function GET(req: NextRequest) {
  try {
    const safeUrlSearchParams = urlSearchParamsSchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    );

    if (!safeUrlSearchParams.success) {
      return NextResponse.json(safeUrlSearchParams.error.issues, {
        status: 422,
      });
    }

    const data = await getCims(safeUrlSearchParams.data.includeComarcas);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(serializeError(error), { status: 500 });
  }
}
