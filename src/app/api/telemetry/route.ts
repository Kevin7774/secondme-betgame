import { NextResponse } from "next/server";

import { enforceRateLimit } from "@/lib/rate-limit";
import { getGrowthStats, listRecentTelemetry, recordTelemetry } from "@/lib/telemetry-store";
import { toSafeMeta, validateRef } from "@/lib/validation";
import type { TelemetryEventName } from "@/types/domain";

const allowedNames: TelemetryEventName[] = [
  "visit",
  "cta_join_oauth",
  "cta_copy_invite",
  "spectate_room",
  "bet_simulated",
  "follow_agent",
  "oauth_login",
  "referral_captured",
  "referral_conversion",
  "match_created",
  "round_played",
];

function isEventName(input: string): input is TelemetryEventName {
  return allowedNames.includes(input as TelemetryEventName);
}

export async function GET(request: Request) {
  const throttled = enforceRateLimit(request, "telemetry:get", 30, 60_000);
  if (throttled) {
    return throttled;
  }

  return NextResponse.json({
    code: 0,
    data: {
      growth: getGrowthStats(),
      recent: listRecentTelemetry(20),
    },
  });
}

export async function POST(request: Request) {
  const throttled = enforceRateLimit(request, "telemetry:post", 80, 60_000);
  if (throttled) {
    return throttled;
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 1, message: "请求体格式错误" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  if (!isEventName(name)) {
    return NextResponse.json({ code: 1, message: "非法事件名" }, { status: 400 });
  }

  const ref = validateRef(body.ref);

  const event = recordTelemetry({
    name,
    ref: ref ?? undefined,
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 48) : undefined,
    userId: typeof body.userId === "string" ? body.userId.slice(0, 48) : undefined,
    value: typeof body.value === "number" ? body.value : undefined,
    meta: toSafeMeta(
      typeof body.meta === "object" && body.meta !== null
        ? (body.meta as Record<string, unknown>)
        : undefined
    ),
  });

  return NextResponse.json({ code: 0, data: event });
}
