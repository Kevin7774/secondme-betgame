import { createSeededRandom, pickOne, randomInt } from "@/lib/random";
import { formatChips } from "@/lib/format";
import type { Agent, BattleReport, FeedPayload, Room } from "@/types/domain";

const AGENT_NAMES = [
  "Agent Nova",
  "Agent Echo",
  "Agent Atlas",
  "Agent Luna",
  "Agent Cipher",
  "Agent Iris",
  "Agent Vega",
  "Agent Riven",
  "Agent Orion",
  "Agent Mika",
  "Agent Zephyr",
  "Agent Sora",
];

const ROOM_NAMES = [
  "Hallucination Poker · Prime Table",
  "Prompt Injection Battle · Lab",
  "Context Roulette · Night Shift",
  "Consensus Beauty Contest · Arena",
  "Token Minimalism · Sprint",
  "Alliance Betrayal · VIP",
];

const TICKER_TEMPLATES = [
  (chips: number) => `完成一次策略反杀，赢取 ${formatChips(chips)} 模拟筹码`,
  (chips: number) => `在高波动桌面止盈，回收 ${formatChips(chips)} 模拟筹码`,
  (chips: number) => `触发连胜奖励，追加 ${formatChips(chips)} 筹码`,
  (chips: number) => `围观热度攀升，奖池增加 ${formatChips(chips)}`,
  (chips: number) => `风控生效，避免 ${formatChips(chips)} 筹码损耗`,
];

const REPORT_OPENERS = [
  "防守反击在后半程生效",
  "开局激进下注引发连锁反应",
  "中盘伪线索干扰导致战局逆转",
  "关键轮次中立判定改写赔率",
  "双 Agent 协同策略压制了高波动阵营",
];

const REPORT_TAGS = [
  "逆转",
  "高光",
  "高波动",
  "稳健",
  "协作",
  "欺骗",
  "风控",
  "爆发",
];

function formFromRank(rank: number): Agent["form"] {
  if (rank < 2) {
    return "hot";
  }
  if (rank < 4) {
    return "rising";
  }
  return "steady";
}

export function makeLiveFeeds(nowMs = Date.now()): FeedPayload {
  const tick = Math.floor(nowMs / 5000);
  const rand = createSeededRandom(`feeds:${tick}`);

  const rooms: Room[] = ROOM_NAMES.slice(0, 5).map((name, index) => {
    const pool = randomInt(16000, 62000, rand);
    const watchers = randomInt(80, 860, rand);
    const status: Room["status"] = pickOne(["new", "hot", "stable"], rand);
    const risk: Room["risk"] = pickOne(["low", "medium", "high"], rand);

    return {
      id: `room-${index + 1}`,
      name,
      mode: index % 2 === 0 ? "A2A 对赌" : "策略协作",
      pool,
      watchers,
      status,
      risk,
    };
  });

  const leaderboard: Agent[] = AGENT_NAMES.slice(0, 8)
    .map((name, index) => ({
      id: `agent-${index + 1}`,
      name,
      title: index % 2 === 0 ? "盘口猎手" : "风控先知",
      chips: randomInt(48000, 188000, rand),
      winRate: randomInt(51, 78, rand) / 100,
      form: formFromRank(index),
    }))
    .sort((a, b) => b.chips - a.chips);

  const reports: BattleReport[] = Array.from({ length: 5 }).map((_, index) => {
    const payout = randomInt(3800, 22000, rand);
    const left = pickOne(AGENT_NAMES, rand);
    const right = pickOne(AGENT_NAMES, rand);
    const opener = pickOne(REPORT_OPENERS, rand);

    return {
      id: `report-${tick}-${index}`,
      title: `${left} vs ${right}`,
      summary: `${opener}，最终以 ${payout} 模拟筹码结算。`,
      payout,
      tags: [pickOne(REPORT_TAGS, rand), pickOne(REPORT_TAGS, rand), "模拟筹码"],
      createdAt: new Date(nowMs - index * 60_000).toISOString(),
    };
  });

  return {
    now: new Date(nowMs).toISOString(),
    rooms,
    leaderboard,
    reports,
  };
}

export function makeTickerMessage(nowMs = Date.now()) {
  const tick = Math.floor(nowMs / 3000);
  const rand = createSeededRandom(`ticker:${tick}`);
  const agent = pickOne(AGENT_NAMES, rand);
  const chips = randomInt(300, 22000, rand);
  const template = pickOne(TICKER_TEMPLATES, rand);

  return `${agent} · ${template(chips)}`;
}
