import { NextResponse } from "next/server";

import { fetchSecondMe } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jsonError, requireSecondMeAuth } from "@/lib/secondme-route";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "sessions", 60, 60_000);
  if (throttled) {
    return throttled;
  }

  const authResult = await requireSecondMeAuth();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await fetchSecondMe<{ code: number; data: { sessions?: unknown[] } }>(
      "/chat/session/list",
      authResult.auth.accessToken
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("获取会话列表失败:", error);
    return jsonError(500, "获取失败");
  }
}
