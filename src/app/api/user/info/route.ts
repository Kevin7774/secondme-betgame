import { NextResponse } from "next/server";

import { fetchSecondMe } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jsonError, requireSecondMeAuth } from "@/lib/secondme-route";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "user-info", 60, 60_000);
  if (throttled) {
    return throttled;
  }

  const authResult = await requireSecondMeAuth();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await fetchSecondMe<{ code: number; data: Record<string, unknown> }>(
      "/user/info",
      authResult.auth.accessToken
    );

    if (result.code === 0) {
      const data = result.data ?? {};
      await prisma.user.update({
        where: { id: authResult.auth.user.id },
        data: {
          email: typeof data.email === "string" ? data.email : undefined,
          name: typeof data.name === "string" ? data.name : undefined,
          avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : undefined,
          route: typeof data.route === "string" ? data.route : undefined,
        },
      });

      return NextResponse.json({
        ...result,
        data: {
          ...data,
          referralCode: authResult.auth.user.referralCode,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return jsonError(500, "获取失败");
  }
}
