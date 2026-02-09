import "server-only";

import { cookies } from "next/headers";

import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "secondme_uid";
const DEFAULT_TOKEN_TTL = 7200;
const EXPIRY_BUFFER_SECONDS = 60;

export type SecondMeTokenPayload = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user_id?: string;
  userId?: string;
  uid?: string;
};

export type SecondMeUserInfo = {
  id?: string;
  userId?: string;
  uid?: string;
  route?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  [key: string]: unknown;
};

function parseJsonSafely(input: string) {
  try {
    return JSON.parse(input) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function toErrorString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    try {
      const serialized = JSON.stringify(value);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function parseErrorCode(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

function buildRemoteErrorMessage(
  fallback: string,
  status: number,
  result: Record<string, unknown> | null,
  text: string
) {
  const detail =
    toErrorString(result?.error_description) ??
    toErrorString(result?.message) ??
    toErrorString(result?.error) ??
    (text.trim() ? text.trim().slice(0, 240) : null);

  return detail ? `${fallback} (HTTP ${status}): ${detail}` : `${fallback} (HTTP ${status})`;
}

function assertPath(path: string) {
  if (!path.startsWith("/") || path.includes("://")) {
    throw new Error("非法 API 路径");
  }
}

export async function getSessionUserId() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function resolveSecondMeRedirectUri(request: Request) {
  const env = getServerEnv();
  const configured = env.SECONDME_REDIRECT_URI;

  if (configured) {
    try {
      const parsed = new URL(configured);
      if (!(process.env.NODE_ENV === "production" && isLoopbackHost(parsed.hostname))) {
        return configured;
      }

      console.warn(
        "[OAuth] SECONDME_REDIRECT_URI points to localhost in production, fallback to request origin."
      );
    } catch {
      console.warn("[OAuth] SECONDME_REDIRECT_URI is invalid, fallback to request origin.");
    }
  }

  return new URL("/api/auth/callback", request.url).toString();
}

export function buildSecondMeApiUrl(path: string) {
  assertPath(path);
  const env = getServerEnv();

  const prefix = process.env.SECONDME_API_PREFIX ?? "";
  const cleanBase = env.SECONDME_API_BASE_URL.endsWith("/")
    ? env.SECONDME_API_BASE_URL.slice(0, -1)
    : env.SECONDME_API_BASE_URL;
  const cleanPrefix = prefix
    ? prefix.startsWith("/")
      ? prefix
      : `/${prefix}`
    : "";

  return `${cleanBase}${cleanPrefix}${path}`;
}

export function buildSecondMeAuthorizeUrl(request: Request) {
  const env = getServerEnv();
  const url = new URL(env.SECONDME_OAUTH_URL);
  const scopes = (process.env.SECONDME_ALLOWED_SCOPES ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  const redirectUri = resolveSecondMeRedirectUri(request);

  url.searchParams.set("client_id", env.SECONDME_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");

  if (scopes.length) {
    url.searchParams.set("scope", scopes.join(" "));
  }

  return url.toString();
}

function normalizeTokenResponse(result: unknown): SecondMeTokenPayload {
  if (result && typeof result === "object" && "code" in result && "data" in result) {
    return (result as { data: SecondMeTokenPayload }).data;
  }

  return result as SecondMeTokenPayload;
}

export async function exchangeCodeForToken(code: string, request: Request) {
  const env = getServerEnv();
  const redirectUri = resolveSecondMeRedirectUri(request);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.SECONDME_CLIENT_ID,
    client_secret: env.SECONDME_CLIENT_SECRET,
    redirect_uri: redirectUri,
  });

  const response = await fetch(env.SECONDME_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  const result = parseJsonSafely(text);
  const remoteCode = parseErrorCode(result?.code);

  if (!response.ok || (remoteCode !== null && remoteCode !== 0)) {
    throw new Error(
      `${buildRemoteErrorMessage("Token 请求失败", response.status, result, text)}; redirect_uri=${redirectUri}`
    );
  }

  return normalizeTokenResponse(result);
}

export async function refreshAccessToken(refreshToken: string) {
  const env = getServerEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.SECONDME_CLIENT_ID,
    client_secret: env.SECONDME_CLIENT_SECRET,
  });

  const response = await fetch(env.SECONDME_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  const result = parseJsonSafely(text);
  const remoteCode = parseErrorCode(result?.code);

  if (!response.ok || (remoteCode !== null && remoteCode !== 0)) {
    throw new Error(buildRemoteErrorMessage("刷新 Token 失败", response.status, result, text));
  }

  return normalizeTokenResponse(result);
}

export function resolveSecondMeUserId(
  info: SecondMeUserInfo | null,
  tokenPayload?: SecondMeTokenPayload
) {
  return (
    info?.id ??
    info?.userId ??
    info?.uid ??
    info?.route ??
    info?.email ??
    tokenPayload?.user_id ??
    tokenPayload?.userId ??
    tokenPayload?.uid ??
    null
  );
}

export async function fetchSecondMe<T>(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(buildSecondMeApiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();
  const result = parseJsonSafely(text);
  const remoteCode = parseErrorCode(result?.code);

  if (!response.ok || (remoteCode !== null && remoteCode !== 0)) {
    throw new Error(buildRemoteErrorMessage("SecondMe API 请求失败", response.status, result, text));
  }

  if (!result) {
    throw new Error("SecondMe API 返回了非 JSON 响应");
  }

  return result as T;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getValidAccessToken() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const now = Date.now();
  const expiresAt = user.tokenExpiresAt.getTime();
  if (expiresAt - now > EXPIRY_BUFFER_SECONDS * 1000) {
    return { user, accessToken: user.accessToken };
  }

  const refreshed = await refreshAccessToken(user.refreshToken);
  const expiresIn = refreshed.expires_in ?? DEFAULT_TOKEN_TTL;
  const nextExpiresAt = new Date(Date.now() + expiresIn * 1000);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? user.refreshToken,
      tokenExpiresAt: nextExpiresAt,
    },
  });

  return { user: updated, accessToken: updated.accessToken };
}
