"use client";

import { useCallback, useMemo } from "react";

import { sendTelemetry } from "@/lib/secondme-client";
import type { TelemetryEventName } from "@/types/domain";

const SESSION_KEY = "sm_session_id";

function getSessionId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

export function useTelemetry() {
  const sessionId = useMemo(() => getSessionId(), []);

  const track = useCallback(
    async (
      name: TelemetryEventName,
      payload?: {
        ref?: string;
        userId?: string;
        value?: number;
        meta?: Record<string, string | number | boolean>;
      }
    ) => {
      await sendTelemetry({
        name,
        sessionId,
        ...payload,
      });
    },
    [sessionId]
  );

  return { sessionId, track };
}
