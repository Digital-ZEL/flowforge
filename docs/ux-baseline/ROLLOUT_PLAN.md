# Rollout Plan — FlowForge V2

> Created: 2026-02-06  
> Status: Pre-launch  
> Environment: Vercel (https://flowforge-three.vercel.app)

---

## Overview

Three-phase rollout with data-driven gates between phases. Each phase has clear entry criteria, rollback procedures, and monitoring requirements.

```
Phase 1: Opt-in         Phase 2: V2 Default      Phase 3: Legacy Removal
──────────────────── → ──────────────────── → ────────────────────
V2 at /v2               V2 at /                  V2 only
Legacy at /             Legacy at /classic       Legacy deleted
"Try V2" banner         "Classic" link           Clean codebase
2+ weeks                2+ weeks                 After 30 days
```

---

## Phase 1: Opt-In (V2 at `/v2`)

### What

- V2 UI deployed under `/v2` route prefix
- Legacy UI unchanged at all existing routes
- "Try the new FlowForge V2" banner on legacy pages
- Easy switch back from V2 to legacy

### Entry Criteria

- [ ] V2 components pass a11y checklist (see `A11Y_CHECKLIST.md`)
- [ ] V2 routes build under 100 kB first-load JS
- [ ] All V2 pages functional (create, view, analyze, export, chat)
- [ ] Analytics events tagged with `ui_version`
- [ ] Rollback tested (env var toggle)

### Implementation

```
src/app/                    ← Legacy UI (unchanged)
src/app/v2/                 ← V2 UI (new)
  ├── page.tsx              ← V2 landing / dashboard
  ├── new/page.tsx          ← V2 process creation
  ├── process/[id]/page.tsx ← V2 process detail
  ├── library/page.tsx      ← V2 library
  └── layout.tsx            ← V2 layout wrapper
```

### Banner Component

```tsx
// On legacy pages:
<div className="bg-brand-50 border-b border-brand-200 px-4 py-2 text-center text-sm">
  ✨ <a href="/v2" className="font-medium text-brand-600 hover:underline">
    Try the new FlowForge V2
  </a> — Redesigned for speed and clarity.
  <button onClick={dismiss} className="ml-2 text-brand-400 hover:text-brand-600">✕</button>
</div>
```

Banner dismissal stored in `localStorage: flowforge_v2_banner_dismissed`.

### Duration

- **Minimum:** 2 weeks
- **Extension:** Up to 4 weeks if sample size insufficient

### Monitoring

- Daily check: V2 error rate vs legacy
- Weekly: Metrics comparison report (see `METRICS_PLAN.md`)
- Continuous: Vercel deployment health

### Exit Criteria → Phase 2

All must be true:
- [ ] ≥ 50 processes created on V2
- [ ] V2 analysis completion rate ≥ 90% of legacy
- [ ] V2 error rate ≤ 1.5× legacy
- [ ] No critical bugs in V2 reported
- [ ] At least 2 full weeks of data

---

## Phase 2: V2 Default (Legacy at `/classic`)

### What

- V2 becomes the default at all standard routes
- Legacy moved to `/classic` prefix for users who need it
- Small "Switch to Classic" link in V2 footer
- `/classic` routes serve the original UI unchanged

### Implementation

```bash
# Environment variable controls which UI is default
NEXT_PUBLIC_UI_VERSION=v2

# Routing:
/               → V2 dashboard
/new            → V2 create
/process/[id]   → V2 detail
/classic        → Legacy dashboard
/classic/new    → Legacy create
/classic/process/[id] → Legacy detail
```

### Entry Criteria

- [ ] Phase 1 exit criteria met
- [ ] V2 metrics equal or better than legacy
- [ ] Team sign-off on V2 readiness

### Duration

- **Minimum:** 2 weeks as default
- **Legacy sunset timer:** 30 days from V2 becoming default

### Monitoring

- Watch for spike in `/classic` usage (users fleeing V2)
- If `/classic` usage > 30% after 1 week, investigate and potentially extend Phase 2

### Exit Criteria → Phase 3

- [ ] < 10% of sessions use `/classic` routes
- [ ] No critical V2 bugs for 2 consecutive weeks
- [ ] 30 days elapsed since V2 became default

---

## Phase 3: Legacy Removal

### What

- Remove all legacy UI code
- Remove `/classic` routes
- Remove `NEXT_PUBLIC_UI_VERSION` toggle
- Clean up dual-route infrastructure

### Implementation

```bash
# Delete legacy files
rm -rf src/app/classic/
# Remove legacy components not shared with V2
# Update layout.tsx to V2-only
# Remove banner/toggle logic
# Remove ui_version from analytics (or keep for historical data)
```

### Checklist

- [ ] Redirect `/classic/*` → `/` with 301
- [ ] Remove legacy-specific components
- [ ] Remove `NEXT_PUBLIC_UI_VERSION` env var
- [ ] Update documentation
- [ ] Final bundle size check (should decrease)
- [ ] Archive legacy code in git tag: `v1-legacy-final`

---

## Rollback Procedures

### Phase 1 Rollback (trivial)

V2 is only at `/v2` — just remove the banner or the `/v2` routes.

```bash
# Remove V2 banner
# Delete src/app/v2/ directory
# Redeploy
vercel --token $VERCEL_TOKEN --yes --prod
```

### Phase 2 Rollback (quick)

Switch default back to legacy:

```bash
# In Vercel environment variables:
NEXT_PUBLIC_UI_VERSION=legacy

# Redeploy
vercel --token $VERCEL_TOKEN --yes --prod
```

**Time to rollback:** < 5 minutes (env var change + deploy)

### Phase 3 Rollback (from git)

If issues found after legacy removal:

```bash
# Revert to tag
git checkout v1-legacy-final
# Cherry-pick any V2 fixes needed
# Redeploy
```

**Time to rollback:** ~30 minutes

---

## Data Migration

### ✅ No Migration Needed

- **IndexedDB:** Both legacy and V2 use the same IndexedDB stores (`flowforge_processes`, `flowforge_analytics`, etc.)
- **API:** Same API routes (`/api/ai/analyze`, `/api/ai/chat`, `/api/auth/login`)
- **Process data format:** V2 uses the same `Process` type from `src/lib/types.ts`
- **User settings:** Same localStorage keys

A process created in legacy can be viewed in V2, and vice versa. No data transformation required.

---

## Environment Variables

| Variable | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| `NEXT_PUBLIC_UI_VERSION` | `legacy` (default) | `v2` | Removed |
| `NEXT_PUBLIC_V2_BANNER` | `true` | `false` | Removed |
| `NEXT_PUBLIC_CLASSIC_ENABLED` | N/A | `true` | `false` → Removed |

---

## Communication Plan

| When | What | Channel |
|---|---|---|
| Phase 1 launch | "Try our redesigned V2 UI" | In-app banner |
| Phase 2 launch | "V2 is now the default" | In-app toast + changelog |
| 2 weeks before Phase 3 | "Classic UI retiring on DATE" | Banner on `/classic` pages |
| Phase 3 | "V2 is the only UI" | Remove all mentions |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| V2 has undiscovered bugs | Medium | High | Phase 1 catches them before default |
| Users resist V2 changes | Low | Medium | Classic fallback + easy switch |
| Bundle size regression | Medium | Low | CI budget check (see `PERFORMANCE_BUDGET.md`) |
| A11y regression in V2 | Low | High | A11y checklist gate before Phase 2 |
| Data incompatibility | Very Low | Critical | Same DB + same types = no risk |

---

## Timeline (Estimated)

| Date | Milestone |
|---|---|
| Week 1-2 | V2 components built + a11y fixes |
| Week 3 | Phase 1 launch (V2 at `/v2`) |
| Week 5 | Phase 1 review — go/no-go for Phase 2 |
| Week 5-6 | Phase 2 launch (V2 default) |
| Week 9-10 | Phase 3 (legacy removal) |
