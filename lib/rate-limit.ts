const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

export function rateLimit(key: string): { allowed: boolean } {
  const now = Date.now();
  const current = store.get(key);
  if (!current || now - current.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false };
  }
  current.count += 1;
  return { allowed: true };
}

