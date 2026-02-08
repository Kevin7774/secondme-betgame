import { NextResponse } from "next/server";

import {
  exchangeCodeForToken,
  fetchSecondMe,
  getAuthCookieName,
  resolveSecondMeUserId,
  type SecondMeUserInfo,
} from "@/lib/auth";
import { deriveReferralCode } from "@/lib/growth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getReferralCookie } from "@/lib/referral";
import { recordTelemetry } from "@/lib/telemetry-store";

const DEFAULT_TOKEN_TTL = 7200;

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "oauth-callback", 20, 60_000);
  if (throttled) {
    return throttled;
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  try {
    const tokenPayload = await exchangeCodeForToken(code);

    if (!tokenPayload?.access_token || !tokenPayload.refresh_token) {
      return NextResponse.redirect(new URL("/?error=token_invalid", request.url));
    }

    const userInfoResult = await fetchSecondMe<{ code: number; data: Record<string, unknown> }>(
      "/user/info",
      tokenPayload.access_token
    );

    const userInfo = (userInfoResult?.data ?? {}) as SecondMeUserInfo;
    const secondmeUserId = resolveSecondMeUserId(userInfo, tokenPayload);

    if (!secondmeUserId) {
      return NextResponse.redirect(new URL("/?error=user_id_missing", request.url));
    }

    const referralCode = deriveReferralCode(secondmeUserId);
    const referredBy = await getReferralCookie();
    const expiresIn = tokenPayload.expires_in ?? DEFAULT_TOKEN_TTL;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    const existingUser = await prisma.user.findUnique({ where: { secondmeUserId } });
    const shouldSetReferral = Boolean(referredBy && !existingUser?.referredBy);

    const user = await prisma.user.upsert({
      where: { secondmeUserId },
      update: {
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token,
        tokenExpiresAt,
        email: typeof userInfo.email === "string" ? userInfo.email : undefined,
        name: typeof userInfo.name === "string" ? userInfo.name : undefined,
        avatarUrl: typeof userInfo.avatarUrl === "string" ? userInfo.avatarUrl : undefined,
        route: typeof userInfo.route === "string" ? userInfo.route : undefined,
        referralCode,
        referredBy: shouldSetReferral ? referredBy : undefined,
        referredAt: shouldSetReferral ? new Date() : undefined,
      },
      create: {
        secondmeUserId,
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token,
        tokenExpiresAt,
        email: typeof userInfo.email === "string" ? userInfo.email : undefined,
        name: typeof userInfo.name === "string" ? userInfo.name : undefined,
        avatarUrl: typeof userInfo.avatarUrl === "string" ? userInfo.avatarUrl : undefined,
        route: typeof userInfo.route === "string" ? userInfo.route : undefined,
        referralCode,
        referredBy: shouldSetReferral ? referredBy : undefined,
        referredAt: shouldSetReferral ? new Date() : undefined,
      },
    });

    recordTelemetry({
      name: "oauth_login",
      userId: user.id,
      ref: referredBy ?? undefined,
      meta: { secondmeUserId },
    });

    if (shouldSetReferral && referredBy && referredBy !== user.referralCode) {
      recordTelemetry({
        name: "referral_conversion",
        userId: user.id,
        ref: referredBy,
      });
    }

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(getAuthCookieName(), user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("OAuth 回调失败:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
