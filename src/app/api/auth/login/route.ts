import { NextResponse } from "next/server";

import { buildSecondMeAuthorizeUrl } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "oauth-login", 30, 60_000);
  if (throttled) {
    return throttled;
  }

  const url = buildSecondMeAuthorizeUrl();
  return NextResponse.redirect(url);
}
