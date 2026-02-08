import { cookies } from "next/headers";

import { sanitizeText, validateRef } from "@/lib/validation";

export const REF_COOKIE = "sm_ref";

export function extractRefFromUrl(url: string) {
  const value = new URL(url).searchParams.get("ref");
  return validateRef(value);
}

export async function setReferralCookie(value: string) {
  const safeRef = validateRef(value);
  if (!safeRef) {
    return null;
  }

  const store = await cookies();
  store.set(REF_COOKIE, safeRef, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return safeRef;
}

export async function getReferralCookie() {
  const store = await cookies();
  const value = store.get(REF_COOKIE)?.value;
  return validateRef(value);
}

export function normalizeInviteCode(input: unknown) {
  return sanitizeText(input, 48);
}
