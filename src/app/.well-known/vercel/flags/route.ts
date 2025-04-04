import { verifyAccess, type ApiData } from "flags";
import { getProviderData } from "flags/next";
import { NextResponse, type NextRequest } from "next/server";
import * as flags from "../../../../lib/flags";

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return NextResponse.json(null, { status: 401 });

  const { getFeatureFlags, ...featureFlags } = flags;

  const providerData = getProviderData(featureFlags);
  return NextResponse.json<ApiData>(providerData);
}
