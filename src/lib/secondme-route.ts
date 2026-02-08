import { NextResponse } from "next/server";
import type { User } from "@prisma/client";

import { buildSecondMeApiUrl, getValidAccessToken } from "@/lib/auth";

export type AuthContext = {
  user: User;
  accessToken: string;
};

type AuthCheck =
  | {
      ok: true;
      auth: AuthContext;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireSecondMeAuth(): Promise<AuthCheck> {
  const auth = await getValidAccessToken();
  if (!auth) {
    return {
      ok: false,
      response: jsonError(401, "未登录"),
    };
  }

  return {
    ok: true,
    auth,
  };
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ code: status, message }, { status });
}

export async function proxySecondMeStream(
  path: string,
  accessToken: string,
  body: Record<string, unknown>
) {
  const upstream = await fetch(buildSecondMeApiUrl(path), {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok || !upstream.body) {
    return jsonError(upstream.status, "上游服务失败");
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
