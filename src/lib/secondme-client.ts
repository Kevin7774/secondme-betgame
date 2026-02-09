import type {
  FeedPayload,
  GrowthStats,
  Match,
  MatchRequest,
  TelemetryEvent,
  TelemetryEventName,
} from "@/types/domain";

export type ApiOutcome<T> = {
  ok: boolean;
  data: T | null;
  message?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseCode(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

function parseJsonSafely(input: string) {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

function toMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (isObject(payload)) {
    const candidates = [payload.message, payload.error_description, payload.error];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiOutcome<T>> {
  try {
    const response = await fetch(path, { ...init, cache: "no-store" });
    const text = await response.text();
    const parsed = parseJsonSafely(text);

    if (!response.ok) {
      return {
        ok: false,
        data: null,
        message: toMessage(parsed, `请求失败 (HTTP ${response.status})`),
      };
    }

    if (!isObject(parsed)) {
      return {
        ok: false,
        data: null,
        message: "响应格式异常",
      };
    }

    const code = parseCode(parsed.code);
    if (code === 0) {
      return {
        ok: true,
        data: ("data" in parsed ? (parsed.data as T) : null) ?? null,
      };
    }

    return {
      ok: false,
      data: null,
      message: toMessage(parsed, "响应异常"),
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: error instanceof Error ? error.message : "网络异常",
    };
  }
}

export async function apiGet<T>(path: string) {
  return request<T>(path);
}

export async function apiPost<T, B extends object>(path: string, body?: B) {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function fetchUserInfo<T>() {
  return apiGet<T>("/api/user/info");
}

export async function fetchAuthSession() {
  return apiGet<{ loggedIn: boolean }>("/api/auth/session");
}

export async function fetchShades<T>() {
  return apiGet<T>("/api/user/shades");
}

export async function fetchSoftmemory<T>() {
  return apiGet<T>("/api/user/softmemory");
}

export async function fetchSessions<T>() {
  return apiGet<T>("/api/sessions");
}

export async function addNote(content: string) {
  return apiPost<{ noteId?: number }, { content: string }>("/api/note", { content });
}

export async function logout() {
  return apiPost<unknown, Record<string, never>>("/api/auth/logout");
}

export async function fetchFeeds() {
  return apiGet<FeedPayload & { growth: GrowthStats }>("/api/feeds");
}

export async function sendTelemetry(payload: {
  name: TelemetryEventName;
  ref?: string;
  userId?: string;
  sessionId?: string;
  value?: number;
  meta?: Record<string, string | number | boolean>;
}) {
  return apiPost<TelemetryEvent, typeof payload>("/api/telemetry", payload);
}

export async function fetchGrowthSnapshot() {
  return apiGet<{ growth: GrowthStats; recent: TelemetryEvent[] }>("/api/telemetry");
}

export async function mutateMatch(body: MatchRequest) {
  return apiPost<Match, MatchRequest>("/api/matches", body);
}
