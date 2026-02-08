import type {
  FeedPayload,
  GrowthStats,
  Match,
  MatchRequest,
  TelemetryEvent,
  TelemetryEventName,
} from "@/types/domain";

export type ApiResult<T> = {
  code: number;
  data: T;
  message?: string;
};

export type ApiOutcome<T> = {
  ok: boolean;
  data: T | null;
  message?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiOutcome<T>> {
  try {
    const response = await fetch(path, { ...init, cache: "no-store" });
    const result = (await response.json()) as ApiResult<T> | { message?: string };

    if (!response.ok) {
      return {
        ok: false,
        data: null,
        message: result?.message ?? "请求失败",
      };
    }

    if ("code" in result && result.code === 0) {
      return { ok: true, data: (result as ApiResult<T>).data };
    }

    return {
      ok: false,
      data: null,
      message: (result as ApiResult<T>).message ?? "响应异常",
    };
  } catch {
    return { ok: false, data: null, message: "网络异常" };
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
