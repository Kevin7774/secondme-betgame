import { NextResponse } from "next/server";

import { createMatch, playRound } from "@/lib/match-engine";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordTelemetry } from "@/lib/telemetry-store";
import { sanitizeText } from "@/lib/validation";
import type { MatchRequest } from "@/types/domain";

export async function POST(request: Request) {
  const throttled = enforceRateLimit(request, "matches", 40, 60_000);
  if (throttled) {
    return throttled;
  }

  let body: MatchRequest;
  try {
    body = (await request.json()) as MatchRequest;
  } catch {
    return NextResponse.json({ code: 1, message: "请求体格式错误" }, { status: 400 });
  }

  if (body.action === "create") {
    const match = createMatch(body.seed, body.challengerName, body.defenderName);

    recordTelemetry({
      name: "match_created",
      meta: {
        matchId: match.id,
        seed: match.seed,
      },
    });

    return NextResponse.json({ code: 0, data: match });
  }

  if (body.action === "round") {
    const strategy = body.strategy;
    if (!["aggressive", "balanced", "defensive"].includes(strategy)) {
      return NextResponse.json({ code: 1, message: "非法策略" }, { status: 400 });
    }

    const matchId = sanitizeText(body.matchId, 80);
    const claim = sanitizeText(body.claim, 120);

    if (!matchId || !claim) {
      return NextResponse.json({ code: 1, message: "参数缺失" }, { status: 400 });
    }

    const result = playRound({
      action: "round",
      matchId,
      strategy,
      claim,
    });

    if (result.code !== 0 || !result.data) {
      return NextResponse.json(result, { status: 400 });
    }

    const latestRound = result.data.logs[result.data.logs.length - 1];
    recordTelemetry({
      name: "round_played",
      value: latestRound?.chipsDelta,
      meta: {
        matchId,
        strategy,
        round: result.data.currentRound,
      },
    });

    return NextResponse.json({ code: 0, data: result.data });
  }

  return NextResponse.json({ code: 1, message: "非法 action" }, { status: 400 });
}
