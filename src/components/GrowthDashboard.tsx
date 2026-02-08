import { formatChips } from "@/lib/format";
import type { GrowthStats } from "@/types/domain";

type GrowthDashboardProps = {
  stats: GrowthStats | null;
};

export default function GrowthDashboard({ stats }: GrowthDashboardProps) {
  const data =
    stats ??
    ({
      todayVisits: 0,
      todayOauthLogins: 0,
      todayReferralConversions: 0,
      totalEvents: 0,
    } satisfies GrowthStats);

  const cards = [
    { label: "今日访问", value: data.todayVisits },
    { label: "今日 OAuth 登录", value: data.todayOauthLogins },
    { label: "今日裂变转化", value: data.todayReferralConversions },
    { label: "累计埋点事件", value: data.totalEvents },
  ];

  return (
    <section className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Growth Dashboard</div>
      <h2 className="mt-2 text-xl font-bold text-white">增长看板</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs text-white/60">{card.label}</p>
            <p className="mt-2 text-xl font-semibold text-amber-200">{formatChips(card.value)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
