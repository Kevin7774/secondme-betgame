import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REF_COOKIE = "sm_ref";

function normalizeRef(input: string | null) {
  if (!input) {
    return null;
  }

  const safe = input.trim().slice(0, 48);
  return /^[a-zA-Z0-9_-]{3,48}$/.test(safe) ? safe : null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const incomingRef = normalizeRef(url.searchParams.get("ref"));
  const response = NextResponse.next();

  if (incomingRef) {
    response.cookies.set(REF_COOKIE, incomingRef, {
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
