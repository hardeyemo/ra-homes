import { NextRequest, NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };

// This limits bursts inside an individual serverless instance. It is useful
// immediately, but is not a replacement for a shared store or Vercel WAF:
// instances do not share memory. Keep the interface small so it can later be
// backed by Upstash or another shared limiter without changing route handlers.
const attempts = new Map<string, Entry>();

function clientAddress(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function prune(now: number) {
  if (attempts.size < 10_000) return;
  for (const [key, entry] of Array.from(attempts.entries())) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
}

export function rateLimit(req: NextRequest, bucket: string, max: number, windowMs: number) {
  const now = Date.now();
  prune(now);
  const key = `${bucket}:${clientAddress(req)}`;
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= max) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  existing.count += 1;
  return null;
}
