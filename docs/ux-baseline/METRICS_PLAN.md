# Metrics & Analytics Plan — FlowForge V2

> Created: 2026-02-06  
> Purpose: Track user behavior across legacy and V2 UI for data-driven rollout decisions

---

## 1. Event Taxonomy

All events follow a consistent schema and are tagged for A/B comparison.

### Event Schema

```typescript
interface TrackedEvent {
  id: string;                    // Unique event ID
  type: EventType;               // Event name (see below)
  ui_version: 'legacy' | 'v2';  // Which UI variant
  page: string;                  // Route path (e.g., '/new', '/process/abc')
  timestamp: string;             // ISO 8601
  data: Record<string, string | number>;  // Event-specific payload
  session_id?: string;           // Browser session identifier
  user_id?: string;              // If authenticated
}
```

### Events to Track

| Event | Trigger | Key Data Fields |
|---|---|---|
| `page_view` | Every route change | `page`, `referrer`, `load_time_ms` |
| `process_created` | User submits new process | `industry`, `step_count`, `template_used` |
| `analysis_completed` | AI analysis finishes | `process_id`, `duration_ms`, `health_score` |
| `chat_sent` | User sends chat message | `process_id`, `message_length`, `is_first_message` |
| `export_clicked` | User exports (PDF/PNG/JSON) | `process_id`, `format`, `success` |
| `approval_submitted` | User submits/approves/rejects | `process_id`, `action` (submit/approve/reject) |

### Additional Events (V2-specific)

| Event | Trigger | Key Data Fields |
|---|---|---|
| `v2_banner_clicked` | User clicks "Try V2" banner | `source_page` |
| `v2_banner_dismissed` | User dismisses V2 banner | `source_page` |
| `v2_feedback_submitted` | User submits V2 feedback | `rating`, `comment` |
| `v2_back_to_legacy` | User returns to legacy UI | `source_page`, `time_spent_ms` |

### Current Analytics State

The existing `src/lib/analytics.ts` already tracks:
- ✅ `page_view`
- ✅ `process_created`
- ✅ `template_used`
- ✅ `export_performed`
- ✅ `chat_message_sent`
- ✅ `swimlane_toggle`

**Gaps to fill:**
- ❌ No `ui_version` tag on events
- ❌ No `analysis_completed` event
- ❌ No `approval_submitted` event
- ❌ No session tracking
- ❌ No timing data (load times, duration)

### Required Changes to `analytics.ts`

```typescript
// Add to AnalyticsEventType:
| 'analysis_completed'
| 'approval_submitted'
| 'v2_banner_clicked'
| 'v2_banner_dismissed'
| 'v2_feedback_submitted'
| 'v2_back_to_legacy';

// Add to trackEvent data:
const uiVersion = process.env.NEXT_PUBLIC_UI_VERSION || 'legacy';
const event: AnalyticsEvent = {
  id: generateId(),
  type,
  data: {
    ...data,
    ui_version: uiVersion,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
  },
  timestamp: new Date().toISOString(),
};
```

---

## 2. A/B Test Plan

### Design

| Parameter | Value |
|---|---|
| **Type** | URL-based split (not randomized) |
| **Control** | Legacy UI — all existing routes (`/`, `/new`, `/dashboard`, etc.) |
| **Treatment** | V2 UI — new routes under `/v2` prefix (`/v2`, `/v2/new`, etc.) |
| **Assignment** | Opt-in: users click "Try V2" banner → routed to `/v2` |
| **Persistence** | `localStorage` flag: `flowforge_ui_preference = 'v2' | 'legacy'` |

### Why Not Random Assignment

FlowForge is a productivity tool where UI consistency matters. Randomly switching UIs would frustrate users. Opt-in with easy fallback is more appropriate. Once we have enough V2 opt-in data, we make a go/no-go decision.

### Success Metrics

| Metric | Definition | Target | Method |
|---|---|---|---|
| **Analysis completion rate** | % of created processes that get AI analysis | V2 ≥ Legacy | `analysis_completed` / `process_created` per `ui_version` |
| **Time to first process** | Time from first `page_view` to first `process_created` per session | V2 ≤ Legacy | Timestamp diff in session data |
| **Return rate** | % of users who return within 7 days | V2 ≥ Legacy | Session counting per `user_id` or fingerprint |
| **Export rate** | % of processes exported | V2 ≥ Legacy | `export_clicked` / `process_created` |
| **Chat engagement** | Messages per process | V2 ≥ Legacy | `chat_sent` count per process per version |
| **Error rate** | JS errors + failed API calls | V2 ≤ Legacy | Error boundary tracking + API error events |

### Duration & Sample Size

| Parameter | Value |
|---|---|
| **Minimum duration** | 2 weeks |
| **Target sample** | ≥ 50 process creations per variant |
| **Confidence level** | 95% (p < 0.05) |
| **Extension criteria** | If < 50 samples after 2 weeks, extend to 4 weeks |

### Stop Conditions (Auto-Rollback)

| Condition | Action |
|---|---|
| V2 analysis completion rate < 80% of legacy | **Rollback immediately** |
| V2 error rate > 2× legacy | **Rollback immediately** |
| V2 export rate < 70% of legacy after 1 week | Investigate, consider rollback |
| Zero V2 return users after 1 week | Investigate adoption friction |

---

## 3. Reporting Dashboard

### Where to View

Since FlowForge already has an `/analytics` page that reads from IndexedDB, extend it with:

1. **Version comparison chart** — Side-by-side bars: legacy vs V2 for each metric
2. **Funnel view** — `page_view` → `process_created` → `analysis_completed` → `export_clicked`, split by version
3. **Timeline** — Daily event counts per version

### Weekly Report Template

```
FlowForge A/B Report — Week of YYYY-MM-DD

LEGACY (N=XX sessions):
  - Processes created: XX
  - Analysis completion: XX%
  - Avg time to first process: XXm
  - Export rate: XX%
  - Return rate (7d): XX%

V2 (N=XX sessions):
  - Processes created: XX
  - Analysis completion: XX%
  - Avg time to first process: XXm
  - Export rate: XX%
  - Return rate (7d): XX%

VERDICT: [Continue / Extend / Rollback / Promote V2]
```

---

## 4. Implementation Checklist

- [ ] Add `ui_version` field to all `trackEvent` calls
- [ ] Add `page` field to all `trackEvent` calls
- [ ] Add `analysis_completed` event in analyze API route
- [ ] Add `approval_submitted` event in ApprovalWorkflow
- [ ] Add session ID generation (random UUID per tab, stored in sessionStorage)
- [ ] Add V2 banner click/dismiss events
- [ ] Add V2 back-to-legacy event
- [ ] Create version comparison view in `/analytics`
- [ ] Set up weekly report generation (manual initially)
- [ ] Document stop conditions in team runbook

---

## 5. Privacy Considerations

- **No PII in events:** Events contain route paths and aggregate metrics, no user-entered content
- **Local-first:** All analytics stored in IndexedDB (client-side), not sent to external services
- **If adding server-side analytics later:** Add consent banner, respect Do Not Track header
- **Data retention:** Auto-purge events older than 90 days
