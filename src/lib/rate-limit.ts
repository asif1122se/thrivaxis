const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

// In-memory per-instance limiter — resets on cold start and isn't shared
// across serverless instances. Fine as a first line of defense; swap for
// Upstash/Vercel KV if abuse becomes a real problem.
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}
