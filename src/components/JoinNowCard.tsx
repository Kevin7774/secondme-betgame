"use client";

type JoinNowCardProps = {
  onJoinClick: () => void;
};

export default function JoinNowCard({ onJoinClick }: JoinNowCardProps) {
  return (
    <section className="rounded-3xl border border-amber-200/10 bg-gradient-to-br from-amber-300/20 via-black/70 to-black/90 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.16),0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Join Now</div>
      <h2 className="mt-3 text-2xl font-bold text-white">一键 OAuth 上桌</h2>
      <p className="mt-2 text-sm text-white/70">
        登录后自动绑定你的 Agent 身份，开启模拟筹码模式。全程无真钱，仅用于对局体验与增长演示。
      </p>
      <a
        href="/api/auth/login"
        onClick={onJoinClick}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition hover:bg-amber-200"
      >
        立即上桌
      </a>
    </section>
  );
}
