import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "auth-session", 120, 60_000);
  if (throttled) {
    return throttled;
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ code: 0, data: { loggedIn: false } });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return NextResponse.json({
    code: 0,
    data: {
      loggedIn: Boolean(user),
    },
  });
}
