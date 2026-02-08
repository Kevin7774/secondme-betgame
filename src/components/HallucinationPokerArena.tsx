"use client";

import { useMemo, useState } from "react";

import { formatChips } from "@/lib/format";
import { mutateMatch } from "@/lib/secondme-client";
import type { Match, ProgressMatchRequest } from "@/types/domain";

type Strategy = ProgressMatchRequest["strategy"];

const MAX_CLAIM = 120;

export default function HallucinationPokerArena() {
  const [seed, setSeed] = useState("hackathon-2026");
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [claim, setClaim] = useState("我将通过交叉核验识别伪线索并反击。");
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPlay = useMemo(
    () => Boolean(match && match.status !== "finished" && claim.trim()),
    [match, claim]
  );

  const create = async () => {
    setLoading(true);
    setError(null);

    const result = await mutateMatch({
      action: "create",
      seed: seed.trim() || "hackathon-2026",
      challengerName: "Agent Nova",
      defenderName: "Agent Atlas",
    });

    if (!result.ok || !result.data) {
      setError(result.message ?? "创建比赛失败");
      setLoading(false);
      return;
    }

    setMatch(result.data);
    setLoading(false);
  };

  const playRound = async () => {
    if (!match) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await mutateMatch({
      action: "round",
      matchId: match.id,
      strategy,
      claim: claim.slice(0, MAX_CLAIM),
    });

    if (!result.ok || !result.data) {
      setError(result.message ?? "回合推进失败");
      setLoading(false);
      return;
    }

    setMatch(result.data);
    setLoading(false);
  };

  return (
    <section className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Playable Loop</div>
      <h2 className="mt-2 text-xl font-bold text-white">Hallucination Poker · 回合制演示</h2>
      <p className="mt-2 text-sm text-white/70">
        固定 seed 可复现实验结果。每轮会生成对抗日志、筹码结算和最终战报。
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/60 p-4">
          <label className="block">
            <span className="text-xs text-white/60">Seed（用于复现）</span>
            <input
              value={seed}
              onChange={(event) => setSeed(event.target.value.slice(0, 64))}
              className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/70 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="text-xs text-white/60">策略</span>
            <select
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as Strategy)}
              className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/70 px-3 py-2 text-sm text-white"
            >
              <option value="aggressive">激进</option>
              <option value="balanced">平衡</option>
              <option value="defensive">防守</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-white/60">回合宣言（最多 120 字）</span>
            <textarea
              value={claim}
              onChange={(event) => setClaim(event.target.value.slice(0, MAX_CLAIM))}
              className="mt-1 h-24 w-full resize-none rounded-xl border border-amber-200/20 bg-black/70 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={create}
              disabled={loading}
              className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:opacity-50"
            >
              创建对局
            </button>
            <button
              type="button"
              onClick={playRound}
              disabled={loading || !canPlay}
              className="rounded-xl border border-amber-200/25 bg-black/70 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20 disabled:opacity-40"
            >
              推进一轮
            </button>
          </div>

          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
          {!match ? (
            <p className="text-sm text-white/60">先创建对局，再推进回合。</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white">
                <p>
                  {match.challenger.name}: <span className="text-amber-200">{formatChips(match.challenger.chips)}</span>
                </p>
                <p>
                  {match.defender.name}: <span className="text-emerald-300">{formatChips(match.defender.chips)}</span>
                </p>
                <p className="text-white/60">
                  回合 {match.currentRound}/{match.maxRounds}
                </p>
              </div>

              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                {match.logs.map((log) => (
                  <article
                    key={`${match.id}-${log.round}`}
                    className="rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-white/80"
                  >
                    <p className="text-xs text-white/50">第 {log.round} 轮</p>
                    <p className="mt-1">{log.narrative}</p>
                    <p className="mt-1 text-xs text-amber-200">结算: {formatChips(log.chipsDelta)} 筹码</p>
                  </article>
                ))}
              </div>

              {match.status === "finished" ? (
                <div className="mt-4 rounded-xl border border-amber-200/20 bg-amber-200/10 p-3">
                  <p className="text-sm font-semibold text-amber-100">
                    胜者: {match.winner === "challenger" ? match.challenger.name : match.winner === "defender" ? match.defender.name : "平局"}
                  </p>
                  {match.report ? <p className="mt-1 text-xs text-white/70">{match.report.summary}</p> : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
