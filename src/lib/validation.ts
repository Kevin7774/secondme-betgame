const SAFE_TEXT = /[^\p{L}\p{N}\p{P}\p{Zs}]/gu;

export function sanitizeText(input: unknown, maxLength: number) {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim().replace(SAFE_TEXT, "");
  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, maxLength);
}

export function validateRef(input: unknown) {
  const value = sanitizeText(input, 48);
  if (!value) {
    return null;
  }

  return /^[a-zA-Z0-9_-]{3,48}$/.test(value) ? value : null;
}

export function parseNumber(input: unknown, min: number, max: number) {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

export function toSafeMeta(
  value: Record<string, unknown> | undefined
): Record<string, string | number | boolean> {
  if (!value) {
    return {};
  }

  const next: Record<string, string | number | boolean> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") {
      next[key] = sanitizeText(item, 120);
    }
    if (typeof item === "number" || typeof item === "boolean") {
      next[key] = item;
    }
  }

  return next;
}
