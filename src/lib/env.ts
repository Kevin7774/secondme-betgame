import "server-only";

import { getSecondMeState } from "@/lib/secondme-state";

type ServerEnv = {
  SECONDME_CLIENT_ID: string;
  SECONDME_CLIENT_SECRET: string;
  SECONDME_REDIRECT_URI?: string;
  SECONDME_API_BASE_URL: string;
  SECONDME_API_PREFIX: string;
  SECONDME_OAUTH_URL: string;
  SECONDME_TOKEN_ENDPOINT: string;
  SECONDME_ALLOWED_SCOPES: string;
};

let cached: ServerEnv | null = null;

function normalizeValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizePrefix(value: string) {
  const prefix = value.trim();
  if (!prefix) {
    return "";
  }

  return prefix.startsWith("/") ? prefix.replace(/\/+$/, "") : `/${prefix.replace(/\/+$/, "")}`;
}

function readWithFallback(envKey: keyof NodeJS.ProcessEnv, ...fallbacks: Array<string | undefined>) {
  const envValue = normalizeValue(process.env[envKey]);
  if (envValue) {
    return envValue;
  }

  for (const fallback of fallbacks) {
    const normalized = normalizeValue(fallback);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function requireConfig(key: keyof NodeJS.ProcessEnv, ...fallbacks: Array<string | undefined>) {
  const value = readWithFallback(key, ...fallbacks);
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export function getServerEnv() {
  if (cached) {
    return cached;
  }

  const state = getSecondMeState();
  const config = state?.config;
  const api = state?.api;

  const scopesFromState = Array.isArray(config?.allowed_scopes)
    ? config.allowed_scopes.filter((item) => typeof item === "string" && item.trim()).join(" ")
    : undefined;

  cached = {
    SECONDME_CLIENT_ID: requireConfig("SECONDME_CLIENT_ID", config?.client_id),
    SECONDME_CLIENT_SECRET: requireConfig("SECONDME_CLIENT_SECRET", config?.client_secret),
    SECONDME_REDIRECT_URI: readWithFallback("SECONDME_REDIRECT_URI", config?.redirect_uri),
    SECONDME_API_BASE_URL: requireConfig("SECONDME_API_BASE_URL", api?.base_url),
    SECONDME_API_PREFIX: normalizePrefix(
      readWithFallback("SECONDME_API_PREFIX", api?.api_prefix) ?? "/api/secondme"
    ),
    SECONDME_OAUTH_URL: requireConfig("SECONDME_OAUTH_URL", api?.oauth_url),
    SECONDME_TOKEN_ENDPOINT: requireConfig("SECONDME_TOKEN_ENDPOINT", api?.token_endpoint),
    SECONDME_ALLOWED_SCOPES: readWithFallback("SECONDME_ALLOWED_SCOPES", scopesFromState) ?? "",
  };

  return cached;
}
