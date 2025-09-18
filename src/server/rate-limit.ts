const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 10;

type RateLimitRecord = {
  count: number;
  reset: number;
};

type RateLimitStore = Map<string, RateLimitRecord>;

declare global {
  var __rateLimitStore: RateLimitStore | undefined;
}

function getStore(): RateLimitStore {
  if (!globalThis.__rateLimitStore) {
    globalThis.__rateLimitStore = new Map();
  }
  return globalThis.__rateLimitStore;
}

export type RateLimitOptions = {
  key: string;
  windowMs?: number;
  max?: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export function rateLimit({ key, windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX }: RateLimitOptions): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: max - 1, reset: now + windowMs };
  }

  if (existing.count >= max) {
    return { success: false, remaining: 0, reset: existing.reset };
  }

  const updated: RateLimitRecord = {
    count: existing.count + 1,
    reset: existing.reset,
  };
  store.set(key, updated);

  return {
    success: true,
    remaining: Math.max(0, max - updated.count),
    reset: existing.reset,
  };
}
