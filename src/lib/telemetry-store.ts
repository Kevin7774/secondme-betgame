import type { GrowthStats, TelemetryEvent, TelemetryEventName } from "@/types/domain";

const MAX_EVENTS = 2000;
const events: TelemetryEvent[] = [];

function nowIso() {
  return new Date().toISOString();
}

function eventId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function isToday(ts: string) {
  const now = new Date();
  const eventDate = new Date(ts);
  return (
    now.getUTCFullYear() === eventDate.getUTCFullYear() &&
    now.getUTCMonth() === eventDate.getUTCMonth() &&
    now.getUTCDate() === eventDate.getUTCDate()
  );
}

export function recordTelemetry(input: {
  name: TelemetryEventName;
  ref?: string;
  userId?: string;
  sessionId?: string;
  value?: number;
  meta?: Record<string, string | number | boolean>;
}) {
  const item: TelemetryEvent = {
    id: eventId(),
    ts: nowIso(),
    name: input.name,
    ref: input.ref,
    userId: input.userId,
    sessionId: input.sessionId,
    value: input.value,
    meta: input.meta,
  };

  events.unshift(item);
  if (events.length > MAX_EVENTS) {
    events.length = MAX_EVENTS;
  }

  return item;
}

export function listRecentTelemetry(limit = 100) {
  return events.slice(0, Math.max(1, Math.min(limit, 300)));
}

export function getGrowthStats(): GrowthStats {
  const todayEvents = events.filter((item) => isToday(item.ts));

  return {
    todayVisits: todayEvents.filter((item) => item.name === "visit").length,
    todayOauthLogins: todayEvents.filter((item) => item.name === "oauth_login").length,
    todayReferralConversions: todayEvents.filter((item) => item.name === "referral_conversion").length,
    totalEvents: events.length,
  };
}
