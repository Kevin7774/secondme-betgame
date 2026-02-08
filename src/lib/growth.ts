import { sanitizeText } from "@/lib/validation";

export function deriveReferralCode(input: string) {
  const safe = sanitizeText(input, 32).toLowerCase().replace(/[^a-z0-9]/g, "");
  return `ag${(safe || "guest").slice(0, 8)}`;
}
