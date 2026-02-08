import { jsonError, proxySecondMeStream, requireSecondMeAuth } from "@/lib/secondme-route";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/validation";

export async function POST(request: Request) {
  const throttled = enforceRateLimit(request, "act", 45, 60_000);
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

  const message = sanitizeText(body.message, 400);
  const actionControl = sanitizeText(body.actionControl, 1500);
  const sessionId = sanitizeText(body.sessionId, 120);
  const systemPrompt = sanitizeText(body.systemPrompt, 500);

  if (!message || !actionControl) {
    return jsonError(400, "缺少参数");
  }

  try {
    return await proxySecondMeStream("/act/stream", authResult.auth.accessToken, {
      message,
      actionControl,
      sessionId: sessionId || undefined,
      systemPrompt: systemPrompt || undefined,
    });
  } catch (error) {
    console.error("Act 接口失败:", error);
    return jsonError(500, "Act 失败");
  }
}
