import { NextResponse } from "next/server";

import { fetchSecondMe } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jsonError, requireSecondMeAuth } from "@/lib/secondme-route";
import { sanitizeText } from "@/lib/validation";

export async function POST(request: Request) {
  const throttled = enforceRateLimit(request, "note", 25, 60_000);
  if (throttled) {
    return throttled;
  }

  const authResult = await requireSecondMeAuth();
  if (!authResult.ok) {
    return authResult.response;
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "请求体格式错误");
  }

  const content = sanitizeText(body.content, 500);
  if (!content) {
    return jsonError(400, "内容不能为空");
  }

  try {
    const result = await fetchSecondMe<{ code: number; data: { noteId?: number } }>(
      "/note/add",
      authResult.auth.accessToken,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("添加笔记失败:", error);
    return jsonError(500, "添加失败");
  }
}
