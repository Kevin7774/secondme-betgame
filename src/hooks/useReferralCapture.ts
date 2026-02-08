"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { sendTelemetry } from "@/lib/secondme-client";

const REF_KEY = "sm_ref";
const VISIT_KEY = "sm_visit_logged";

function normalizeRef(input: string | null) {
  if (!input) {
    return null;
  }

  const safe = input.trim().slice(0, 48);
  return /^[a-zA-Z0-9_-]{3,48}$/.test(safe) ? safe : null;
}

export default function useReferralCapture() {
  const searchParams = useSearchParams();
  const incomingRef = normalizeRef(searchParams.get("ref"));
  const [storedRef] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return normalizeRef(window.localStorage.getItem(REF_KEY));
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const existing = normalizeRef(window.localStorage.getItem(REF_KEY));
    const finalRef = incomingRef ?? existing;

    if (!finalRef) {
      if (window.sessionStorage.getItem(VISIT_KEY)) {
        return;
      }
      window.sessionStorage.setItem(VISIT_KEY, "1");
      void sendTelemetry({
        name: "visit",
        meta: { source: "direct", landing: "home" },
      });
      return;
    }

    window.localStorage.setItem(REF_KEY, finalRef);
    document.cookie = `${REF_KEY}=${finalRef};path=/;max-age=${60 * 60 * 24 * 14};samesite=lax`;

    if (window.sessionStorage.getItem(VISIT_KEY)) {
      return;
    }
    window.sessionStorage.setItem(VISIT_KEY, "1");

    void sendTelemetry({
      name: "visit",
      ref: finalRef,
      meta: { source: incomingRef ? "query" : "local", landing: "home" },
    });

    if (incomingRef) {
      void sendTelemetry({
        name: "referral_captured",
        ref: finalRef,
        meta: { source: "query" },
      });
    }
  }, [incomingRef]);

  return incomingRef ?? storedRef;
}
