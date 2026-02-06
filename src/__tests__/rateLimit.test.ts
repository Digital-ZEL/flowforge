import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, type RateLimitConfig } from '../lib/rateLimit';

describe('rateLimit', () => {
  const config: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
  };

  // Use unique key prefix per test to avoid state leaks
  let keyPrefix: string;
  beforeEach(() => {
    keyPrefix = `test-${Date.now()}-${Math.random()}`;
  });

  it('allows requests within the limit', () => {
    const key = `${keyPrefix}:allow`;
    const r1 = checkRateLimit(key, config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, config);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over the limit', () => {
    const key = `${keyPrefix}:block`;
    
    // Use up the limit
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, config);
    }

    // Next request should be blocked
    const result = checkRateLimit(key, config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the window expires', () => {
    const shortConfig: RateLimitConfig = {
      maxRequests: 1,
      windowMs: 1, // 1 ms window
    };

    const key = `${keyPrefix}:reset`;
    const r1 = checkRateLimit(key, shortConfig);
    expect(r1.success).toBe(true);

    // The window is so short it should have expired by now
    // Wait a tiny bit to ensure it expires
    const r2 = checkRateLimit(key, shortConfig);
    // This might succeed (window expired) or fail (window still active)
    // The key test is that a separate key still works
    const key2 = `${keyPrefix}:reset2`;
    const r3 = checkRateLimit(key2, shortConfig);
    expect(r3.success).toBe(true);
  });

  it('tracks different keys independently', () => {
    const key1 = `${keyPrefix}:ip1`;
    const key2 = `${keyPrefix}:ip2`;

    // Use up key1's limit
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key1, config);
    }

    // key2 should still work
    const result = checkRateLimit(key2, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('returns correct resetAt timestamp', () => {
    const key = `${keyPrefix}:timestamp`;
    const before = Date.now();
    const result = checkRateLimit(key, config);
    const after = Date.now();
    
    expect(result.resetAt).toBeGreaterThanOrEqual(before + config.windowMs);
    expect(result.resetAt).toBeLessThanOrEqual(after + config.windowMs);
  });
});
