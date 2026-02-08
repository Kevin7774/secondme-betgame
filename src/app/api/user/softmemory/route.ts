import { NextResponse } from "next/server";

import { fetchSecondMe } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jsonError, requireSecondMeAuth } from "@/lib/secondme-route";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "user-softmemory", 60, 60_000);
  if (throttled) {
    return throttled;
  }

  const authResult = await requireSecondMeAuth();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await fetchSecondMe<{ code: number; data: { list?: unknown[] } }>(
      "/user/softmemory",
      authResult.auth.accessToken
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("获取软记忆失败:", error);
    return jsonError(500, "获取失败");
  }
}
