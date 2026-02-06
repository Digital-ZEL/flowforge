/**
 * In-memory rate limiter suitable for Vercel serverless.
 * 
 * Note: In serverless environments, each cold start gets a fresh map.
 * This means rate limiting is per-instance, not global. For Vercel,
 * this still provides meaningful protection since instances are reused
 * for warm invocations.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  
  const keysToDelete: string[] = [];
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => store.delete(key));
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited.
 * 
 * @param key - Unique identifier (e.g., IP + route)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success=false if rate limited
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup();
  
  const now = Date.now();
  const existing = store.get(key);
  
  if (!existing || now > existing.resetAt) {
    // New window
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, entry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }
  
  if (existing.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }
  
  existing.count += 1;
  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

// Preset configurations
export const RATE_LIMITS = {
  analyze: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  chat: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get the client IP from a request.
 * Handles Vercel's x-forwarded-for header.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
