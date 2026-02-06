# Performance Budget — FlowForge V2

> Last measured: 2026-02-06 (Next.js 14.2.29 production build)

## Targets

| Metric | Target | Hard Limit |
|---|---|---|
| First Load JS (per page) | ≤ 90 kB | 100 kB |
| Total Page Weight | ≤ 400 kB | 500 kB |
| Largest Contentful Paint (LCP) | < 2.0s | < 2.5s |
| Interaction to Next Paint (INP) | < 150ms | < 200ms |
| Cumulative Layout Shift (CLS) | < 0.05 | < 0.1 |
| Time to First Byte (TTFB) | < 400ms | < 800ms |

## Current Build Measurements

### First Load JS per Route

| Route | First Load JS | Status |
|---|---|---|
| `/` (landing) | 91.8 kB | ⚠️ Near limit (91.8/100 kB) |
| `/analytics` | 91.3 kB | ⚠️ Near limit |
| `/collaborate/[id]` | 110 kB | ❌ **OVER BUDGET** (+10 kB) |
| `/dashboard` | 95.4 kB | ⚠️ Near limit |
| `/demo` | 94.6 kB | ⚠️ Near limit |
| `/executive` | 95.9 kB | ⚠️ Near limit |
| `/library` | 95.1 kB | ⚠️ Near limit |
| `/login` | 89.8 kB | ✅ Under budget |
| `/new` | 96.4 kB | ⚠️ Near limit |
| `/org-dashboard` | 96.6 kB | ⚠️ Near limit |
| `/process/[id]` | 99.9 kB | ⚠️ At limit |
| `/settings` | 91.5 kB | ⚠️ Near limit |
| `/share/[id]` | 108 kB | ❌ **OVER BUDGET** (+8 kB) |
| `/templates` | 93.2 kB | ⚠️ Near limit |

### Shared Chunks (loaded on every page)

| Chunk | Size |
|---|---|
| `chunks/117-*.js` | 31.8 kB |
| `chunks/fd9d1056-*.js` | 53.6 kB |
| Other shared chunks | 2.76 kB |
| **Total shared** | **88.2 kB** |

### Middleware

| Component | Size |
|---|---|
| Middleware | 26.5 kB |

## Analysis & Recommendations

### ❌ Over-Budget Routes

1. **`/collaborate/[id]`** (110 kB) — Likely caused by collaboration UI + real-time components. Consider:
   - Lazy-load collaboration features (`React.lazy` / `next/dynamic`)
   - Code-split the comment/feedback panel
   
2. **`/share/[id]`** (108 kB) — Sharing page pulls in process visualization. Consider:
   - Dynamic import for `@xyflow/react` (major contributor)
   - Server-side render the static view, lazy-load interactive parts

### ⚠️ Shared Bundle (88.2 kB)

The shared JS bundle is 88.2 kB — this loads on **every page** and is the primary reason most routes hover near 90-96 kB. The biggest chunk (53.6 kB) is likely React + React DOM + Next.js runtime.

**Reduction strategies:**
- Tree-shake `idb` (only import needed functions)
- Ensure `jspdf` and `html-to-image` are NOT in the shared bundle (dynamic import only)
- Audit `@xyflow/react` — if it's in the shared bundle, move to per-page dynamic imports

### V2 Component Impact

V2 components (`Button`, `Input`, `Card`) are lightweight primitives with no external deps. They use CSS custom properties instead of additional CSS-in-JS, so their bundle impact is minimal (< 2 kB total).

## Enforcement

### CI Check (add to `.github/workflows/ci.yml`)

```yaml
- name: Check bundle size
  run: |
    npm run build 2>&1 | tee build-output.txt
    # Fail if any route exceeds 100kB first-load JS
    if grep -E '^\├|^\└' build-output.txt | grep -E '[0-9]{3} kB' | grep -v 'shared'; then
      echo "❌ Bundle budget exceeded!"
      exit 1
    fi
```

### Local Check

```bash
npm run build 2>&1 | grep -E "kB|MB"
```

## Web Vitals Monitoring

Add `web-vitals` reporting to `src/app/layout.tsx`:

```tsx
// src/lib/vitals.ts
export function reportWebVitals(metric: { name: string; value: number }) {
  // Send to analytics endpoint
  if (typeof window !== 'undefined') {
    console.log(`[Vitals] ${metric.name}: ${metric.value}`);
  }
}
```

### Field Data Collection

- **Vercel Analytics** (built-in): Enable in Vercel dashboard → Analytics tab
- **Custom**: Use `web-vitals` library to report LCP, INP, CLS to IndexedDB analytics store
- **Tag all metrics** with `ui_version: 'legacy' | 'v2'` for A/B comparison

## Review Schedule

| When | Action |
|---|---|
| Every PR | CI bundle check (automated) |
| Weekly | Review Vercel Analytics for Core Web Vitals regressions |
| Before V2 default rollout | Full Lighthouse audit, compare legacy vs V2 |
| Monthly | Reassess budget targets based on user data |
