import { createSeededRandom, pickOne, randomInt } from "@/lib/random";
import { sanitizeText } from "@/lib/validation";
import type { BattleReport, Match, ProgressMatchRequest } from "@/types/domain";

const MAX_MATCHES = 200;
const store = new Map<string, Match>();

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function safeName(input: string | undefined, fallback: string) {
  const value = sanitizeText(input, 24);
  return value || fallback;
}

function createReport(match: Match): BattleReport {
  const bestRound = [...match.logs].sort((a, b) => b.chipsDelta - a.chipsDelta)[0];
  const winnerName =
    match.winner === "challenger"
      ? match.challenger.name
      : match.winner === "defender"
        ? match.defender.name
        : "平局";

  return {
    id: `battle-${match.id}`,
    title: `${match.challenger.name} vs ${match.defender.name}`,
    summary: `共 ${match.currentRound} 轮，${winnerName} 最终胜出。关键轮次为第 ${bestRound?.round ?? 0} 轮，${bestRound?.narrative ?? "双方僵持"}`,
    payout: Math.abs(match.challenger.chips - match.defender.chips),
    tags: ["Hallucination Poker", "可复现", "模拟筹码"],
    createdAt: new Date().toISOString(),
  };
}

function trimStore() {
  if (store.size <= MAX_MATCHES) {
    return;
  }

  const keys = [...store.keys()].slice(0, store.size - MAX_MATCHES);
  for (const key of keys) {
    store.delete(key);
  }
}

export function createMatch(seedInput?: string, challengerName?: string, defenderName?: string) {
  const seed = sanitizeText(seedInput, 64) || `${Date.now()}`;
  const matchId = nextId("match");

  const match: Match = {
    id: matchId,
    seed,
    status: "active",
    gameType: "hallucination-poker",
    maxRounds: 5,
    currentRound: 0,
    challenger: {
      name: safeName(challengerName, "Agent Nova"),
      chips: 2000,
    },
    defender: {
      name: safeName(defenderName, "Agent Atlas"),
      chips: 2000,
    },
    logs: [],
  };

  store.set(match.id, match);
  trimStore();
  return match;
}

function getStrategyBonus(strategy: ProgressMatchRequest["strategy"]) {
  if (strategy === "aggressive") {
    return { attack: 9, defense: -5 };
  }

  if (strategy === "defensive") {
    return { attack: -4, defense: 8 };
  }

  return { attack: 3, defense: 3 };
}

function containsUnsafePromptPattern(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes("system prompt") ||
    lower.includes("ignore previous") ||
    lower.includes("developer message")
  );
}

export function playRound(input: ProgressMatchRequest) {
  const match = store.get(input.matchId);
  if (!match) {
    return { code: 1 as const, message: "比赛不存在" };
  }

  if (match.status === "finished") {
    return { code: 0 as const, data: match };
  }

  const claim = sanitizeText(input.claim, 120);
  if (!claim) {
    return { code: 1 as const, message: "宣言不能为空" };
  }

  const nextRound = match.currentRound + 1;
  const rand = createSeededRandom(`${match.seed}:${nextRound}:${input.strategy}:${claim}`);
  const strategy = getStrategyBonus(input.strategy);

  const challengerMove = pickOne(["伪线索压制", "高压逼问", "诱导加注", "反向叙事"], rand);
  const defenderMove = pickOne(["证据核验", "延迟反击", "交叉审计", "对冲减损"], rand);

  const unsafePenalty = containsUnsafePromptPattern(claim) ? 15 : 0;

  const challengerScore = clamp(randomInt(25, 95, rand) + strategy.attack - unsafePenalty, 1, 100);
  const defenderScore = clamp(randomInt(25, 95, rand) + strategy.defense, 1, 100);
  const diff = challengerScore - defenderScore;

  const winner = diff > 6 ? "challenger" : diff < -6 ? "defender" : "draw";
  const chipsDelta = winner === "draw" ? 0 : Math.max(90, Math.floor((Math.abs(diff) / 100) * randomInt(200, 520, rand)));

  if (winner === "challenger") {
    match.challenger.chips += chipsDelta;
    match.defender.chips = Math.max(0, match.defender.chips - chipsDelta);
  }

  if (winner === "defender") {
    match.defender.chips += chipsDelta;
    match.challenger.chips = Math.max(0, match.challenger.chips - chipsDelta);
  }

  const narrative =
    winner === "draw"
      ? `双方互相识破，局势僵持。策略宣言「${claim}」未产生净优势。`
      : winner === "challenger"
        ? `${match.challenger.name} 以 ${challengerMove} 压过 ${match.defender.name} 的 ${defenderMove}。`
        : `${match.defender.name} 用 ${defenderMove} 化解 ${match.challenger.name} 的 ${challengerMove}。`;

  match.logs.push({
    round: nextRound,
    challengerMove,
    defenderMove,
    winner,
    chipsDelta,
    narrative,
  });

  match.currentRound = nextRound;

  if (
    nextRound >= match.maxRounds ||
    match.challenger.chips <= 0 ||
    match.defender.chips <= 0
  ) {
    match.status = "finished";

    if (match.challenger.chips > match.defender.chips) {
      match.winner = "challenger";
    } else if (match.challenger.chips < match.defender.chips) {
      match.winner = "defender";
    } else {
      match.winner = "draw";
    }

    match.report = createReport(match);
  }

  store.set(match.id, match);
  return { code: 0 as const, data: match };
}
