export type RiskLevel = "low" | "medium" | "high";

export type Agent = {
  id: string;
  name: string;
  title: string;
  chips: number;
  winRate: number;
  form: "hot" | "steady" | "rising";
};

export type Room = {
  id: string;
  name: string;
  mode: string;
  pool: number;
  watchers: number;
  risk: RiskLevel;
  status: "new" | "hot" | "stable";
};

export type BattleReport = {
  id: string;
  title: string;
  summary: string;
  payout: number;
  tags: string[];
  createdAt: string;
};

export type FeedPayload = {
  now: string;
  rooms: Room[];
  leaderboard: Agent[];
  reports: BattleReport[];
};

export type TelemetryEventName =
  | "visit"
  | "cta_join_oauth"
  | "cta_copy_invite"
  | "spectate_room"
  | "bet_simulated"
  | "follow_agent"
  | "oauth_login"
  | "referral_captured"
  | "referral_conversion"
  | "match_created"
  | "round_played";

export type TelemetryEvent = {
  id: string;
  name: TelemetryEventName;
  ts: string;
  ref?: string;
  userId?: string;
  sessionId?: string;
  value?: number;
  meta?: Record<string, string | number | boolean>;
};

export type GrowthStats = {
  todayVisits: number;
  todayOauthLogins: number;
  todayReferralConversions: number;
  totalEvents: number;
};

export type MatchStatus = "pending" | "active" | "finished";

export type RoundLog = {
  round: number;
  challengerMove: string;
  defenderMove: string;
  winner: "challenger" | "defender" | "draw";
  chipsDelta: number;
  narrative: string;
};

export type MatchParticipant = {
  name: string;
  chips: number;
};

export type Match = {
  id: string;
  seed: string;
  status: MatchStatus;
  gameType: "hallucination-poker";
  maxRounds: number;
  currentRound: number;
  challenger: MatchParticipant;
  defender: MatchParticipant;
  logs: RoundLog[];
  winner?: "challenger" | "defender" | "draw";
  report?: BattleReport;
};

export type CreateMatchRequest = {
  action: "create";
  seed?: string;
  challengerName?: string;
  defenderName?: string;
};

export type ProgressMatchRequest = {
  action: "round";
  matchId: string;
  strategy: "aggressive" | "balanced" | "defensive";
  claim: string;
};

export type MatchRequest = CreateMatchRequest | ProgressMatchRequest;

export type MatchResponse = {
  code: 0 | 1;
  message?: string;
  data?: Match;
};
