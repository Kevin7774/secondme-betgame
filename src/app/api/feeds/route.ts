import { NextResponse } from "next/server";

import { makeLiveFeeds } from "@/lib/mock-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getGrowthStats } from "@/lib/telemetry-store";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "feeds", 120, 60_000);
  if (throttled) {
    return throttled;
  }

  const feeds = makeLiveFeeds();
  const growth = getGrowthStats();

  return NextResponse.json({
    code: 0,
    data: {
      ...feeds,
      growth,
    },
  });
}
