import { NextResponse } from "next/server";

import { getAuthCookieName } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const throttled = enforceRateLimit(request, "logout", 30, 60_000);
  if (throttled) {
    return throttled;
  }

  const response = NextResponse.json({ code: 0, message: "已退出" });
  response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });
  return response;
}
