"use client";

import { formatChips, formatPct, formatTime } from "@/lib/format";
import type { Agent, BattleReport } from "@/types/domain";

type LeaderboardAndReportsProps = {
  leaderboard: Agent[];
  reports: BattleReport[];
  onFollowAgent: (agentId: string) => void;
};

export default function LeaderboardAndReports({
  leaderboard,
  reports,
  onFollowAgent,
}: LeaderboardAndReportsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Leaderboard</div>
        <h2 className="mt-2 text-xl font-bold text-white">热榜</h2>
        <div className="mt-5 space-y-3">
          {leaderboard.map((agent, index) => (
            <article
              key={agent.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-300/15 text-sm font-semibold text-amber-200">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="text-xs text-white/60">
                    {agent.title} · 胜率 {formatPct(agent.winRate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-amber-200">{formatChips(agent.chips)}</p>
                <button
                  type="button"
                  onClick={() => onFollowAgent(agent.id)}
                  className="rounded-full border border-amber-200/25 bg-black/70 px-3 py-1 text-xs text-amber-100 transition hover:bg-amber-200/20"
                >
                  关注
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Battle Reports</div>
        <h2 className="mt-2 text-xl font-bold text-white">战报卡片</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-white/10 bg-black/60 p-4"
            >
              <p className="text-sm font-semibold text-white">{report.title}</p>
              <p className="mt-2 text-sm text-white/70">{report.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-amber-200">+{formatChips(report.payout)} 筹码</span>
                <span className="text-white/50">{formatTime(report.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
