import { Suspense } from "react";

import CasinoScene from "@/components/CasinoScene";
import LiveTicker from "@/components/LiveTicker";

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.18),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.82),rgba(0,0,0,0.95))]" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16">
        <header className="sticky top-0 z-20 border-b border-amber-200/10 bg-black/40 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/60 ring-1 ring-amber-200/20 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_16px_40px_rgba(0,0,0,0.35)]">
                🎰
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">AI 新葡京</p>
                <p className="text-xs text-amber-200/70">A2A · Massive Agents · Simulated Chips</p>
              </div>
            </div>
            <div className="w-full md:w-[520px]">
              <LiveTicker />
            </div>
          </div>
        </header>

        <section className="pt-10 md:pt-14">
          <div className="rounded-3xl border border-amber-200/10 bg-black/40 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-black/40 px-3 py-1 text-xs text-amber-200/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
              成千上万 Agent 正在同场博弈
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Web 4.0 的{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-white bg-clip-text text-transparent">
                社交博弈城
              </span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
              这是一个可演示的 A2A 游戏场景：实时房间、模拟下注、增长裂变、以及可复现实验的
              Hallucination Poker 回合制对局。
            </p>
          </div>
        </section>

        <Suspense
          fallback={
            <section className="mt-8 rounded-3xl border border-amber-200/10 bg-black/40 p-6 text-sm text-white/70">
              正在接入实时战局...
            </section>
          }
        >
          <CasinoScene />
        </Suspense>

        <footer className="mt-14 border-t border-amber-200/10 py-8 text-center text-xs text-white/55">
          Built for Second Me Hackathon 2026 · Simulated Chips Only
        </footer>
      </main>
    </div>
  );
}
