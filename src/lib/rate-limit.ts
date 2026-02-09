import { NextResponse } from "next/server";

type Bucket = {
  resetAt: number;
  count: number;
};

const buckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL_MS = 30_000;
const MAX_BUCKETS = 5000;
let lastCleanupAt = 0;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function cleanupBuckets(now: number) {
  const shouldCleanup =
    now - lastCleanupAt >= CLEANUP_INTERVAL_MS || buckets.size > MAX_BUCKETS;
  if (!shouldCleanup) {
    return;
  }

  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  if (buckets.size <= MAX_BUCKETS) {
    return;
  }

  const overflow = buckets.size - MAX_BUCKETS;
  const oldest = [...buckets.entries()]
    .sort((a, b) => a[1].resetAt - b[1].resetAt)
    .slice(0, overflow);

  for (const [key] of oldest) {
    buckets.delete(key);
  }
}

export function enforceRateLimit(request: Request, key: string, limit: number, windowMs: number) {
  const ip = getClientIp(request);
  const now = Date.now();
  cleanupBuckets(now);
  const bucketKey = `${key}:${ip}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { code: 429, message: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  current.count += 1;
  buckets.set(bucketKey, current);
  return null;
}
