# FlowForge Route Inventory

> **Snapshot date:** 2026-02-06 | **Commit:** b4c3709

---

## Page Routes (15 pages + 3 API routes)

### 1. `/` — Landing Page

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/page.tsx` |
| **Components** | None (self-contained) |
| **Data Source** | None — hardcoded content |
| **Key Interactions** | Hero animation on mount, CTA links to `/new` and `/demo` |
| **Empty State** | N/A (always has content) |
| **Error State** | N/A |
| **First Load JS** | 91.8 kB |
| **Notes** | Before/after comparison grid, feature cards with stagger animations, social proof section |

---

### 2. `/new` — New Process Wizard

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/new/page.tsx` |
| **Components** | `ProgressIndicator` (inline), `Suspense` wrapper |
| **Data Source** | URL search params (template pre-fill), `POST /api/ai/analyze` |
| **Key Interactions** | 1) Select industry (6 radio cards) 2) Describe process (textarea, 50-char min) 3) Select goals (multi-chip) 4) Submit → AI progress animation → redirect to `/process/[id]` |
| **Empty State** | Fresh form with industry-specific placeholder text |
| **Error State** | Error message below form on API failure, "Try Again" button |
| **First Load JS** | 96.4 kB |
| **Notes** | Accepts `?template=...&currentProcess=...&desiredOutcome=...&industry=...` for template pre-fill. Voice input support via Web Speech API. |

---

### 3. `/dashboard` — Personal Dashboard

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/dashboard/page.tsx` |
| **Components** | `QuickStats` (inline), `ProcessCard` (inline) |
| **Data Source** | IndexedDB via `useProcessList()` hook, `getSuggestedNextStep()`, `getFeedbackCount()` |
| **Key Interactions** | Search processes, delete process (with confirmation), click through to `/process/[id]`, view suggested next step per process |
| **Empty State** | "No processes yet" message with CTA links to `/new` and `/templates` |
| **Error State** | Silently catches IndexedDB errors, shows empty state |
| **First Load JS** | 95.4 kB |
| **Notes** | Shows quick stats row: Total Processes, Most Common Bottleneck, Avg Options per Process |

---

### 4. `/library` — Process Library

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/library/page.tsx` |
| **Components** | `LibraryCard` |
| **Data Source** | IndexedDB via `getAllProcesses()`, `DEPARTMENTS` from `categories.ts` |
| **Key Interactions** | Search, filter by department (pill buttons), sort (dropdown: recently updated, name A-Z/Z-A, health score high/low, most steps, oldest), toggle grid/list view |
| **Empty State** | "No processes yet" with links to `/new` and `/templates` |
| **Error State** | Silently catches errors, shows loading spinner then empty state |
| **First Load JS** | 95.1 kB |
| **Notes** | LibraryCard shows mini health gauge, department badge, status badge, owner, step count, relative time |

---

### 5. `/templates` — Template Gallery

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/templates/page.tsx` |
| **Components** | None (self-contained) |
| **Data Source** | `templates` array from `lib/templates.ts` (6 templates) |
| **Key Interactions** | Filter by tag (KYC, Onboarding, Compliance, Portfolio, Review, Rebalancing, ACAT, Transfer, Operations, Surveillance, Risk, Handoff, Partner, Transition, Billing, Fees, Revenue), click "Use Template" → redirect to `/new?template=...` |
| **Empty State** | N/A (always has 6 templates) |
| **Error State** | N/A |
| **First Load JS** | 93.2 kB |
| **Notes** | All templates are Wealth Management industry. Tags extracted from template data. |

---

### 6. `/executive` — Executive Dashboard

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/executive/page.tsx` |
| **Components** | `ExecutiveMetrics`, `ProcessHealthGrid` |
| **Data Source** | IndexedDB via `getAllProcesses()`, `calculateHealthScore()` |
| **Key Interactions** | View KPI cards (total processes, avg health, critical count, approved count), donut chart of health distribution, process health grid (clickable tiles → `/process/[id]`), department pie chart |
| **Empty State** | "No processes found" with CTA to `/new` |
| **Error State** | Silently catches, shows empty state |
| **First Load JS** | 95.9 kB |
| **Notes** | Has its own `computeExecutiveHealth()` that differs from the shared `calculateHealthScore()` |

---

### 7. `/org-dashboard` — Organization Analytics

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/org-dashboard/page.tsx` |
| **Components** | `OrgMetrics`, `RiskMatrix`, `CostCalculator` |
| **Data Source** | IndexedDB via `getAllProcesses()`, `calculateHealthScore()` |
| **Key Interactions** | View org-wide KPIs (metric cards with animated counters), department breakdown bars, 5×5 risk matrix (hover for details), cost calculator with optimization % slider, recent activity feed |
| **Empty State** | "No processes in your organization yet" with CTA |
| **Error State** | Silently catches, shows empty state |
| **First Load JS** | 96.6 kB |
| **Notes** | Heaviest static page. Contains inline `DepartmentBreakdown` and `RecentActivity` components. |

---

### 8. `/analytics` — Usage Analytics

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/analytics/page.tsx` |
| **Components** | `BarChart` (inline), `StatCard` (inline) |
| **Data Source** | IndexedDB via `getAnalyticsStats()` from `lib/analytics.ts` |
| **Key Interactions** | View-only. 4 stat cards (total processes, page views, chat messages, exports) + 4 bar charts (template usage, industry usage, export types, daily activity) |
| **Empty State** | "No data yet" for each empty chart section |
| **Error State** | Silently catches, shows zeroes |
| **First Load JS** | 91.3 kB |
| **Notes** | Analytics are local only — tracks events via client-side IndexedDB |

---

### 9. `/settings` — Settings

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/settings/page.tsx` |
| **Components** | Uses `useToast()` from `Toast` |
| **Data Source** | IndexedDB via `backup.ts` (`estimateStorageUsage`, `downloadBackup`, `importData`) |
| **Key Interactions** | Export all data (JSON download), import data (file picker), view storage usage, clear all data (double confirmation), shows version info |
| **Empty State** | Settings always render, storage shows "Estimating..." then actual values |
| **Error State** | Toast notifications for export/import/clear failures |
| **First Load JS** | 91.5 kB |
| **Notes** | Backup module lazy-imported via `dynamic import()`. File input ref for reset after import. |

---

### 10. `/login` — Login Page

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/login/page.tsx` |
| **Components** | `Suspense` wrapper for `useSearchParams()` |
| **Data Source** | `POST /api/auth/login` |
| **Key Interactions** | Enter password → submit → redirect to `?redirect` param or `/dashboard` |
| **Empty State** | Clean form |
| **Error State** | Inline error message ("Incorrect password", "Something went wrong") |
| **First Load JS** | 89.8 kB |
| **Notes** | **Currently dead code** — middleware auth is disabled, so this page is never forced. Accepts `?redirect=` for post-login redirect. |

---

### 11. `/demo` — Demo Mode

| Property | Value |
|----------|-------|
| **Type** | Static (○) |
| **File** | `src/app/demo/page.tsx` |
| **Components** | None (redirect page) |
| **Data Source** | Hardcoded `DEMO_PROCESS` constant (full AnalysisResult with 13 steps, 3 bottlenecks, 2 optimization options) |
| **Key Interactions** | Auto-saves demo process to IndexedDB, checks if already exists → redirects to `/process/demo-client-onboarding` |
| **Empty State** | Loading spinner during save |
| **Error State** | Console error + redirect to home |
| **First Load JS** | 94.6 kB |
| **Notes** | Uses fixed ID `demo-client-onboarding`. Industry: "wealth-management". Title: "Client Onboarding — Wealth Management". |

---

### 12. `/process/[id]` — Process Detail (Main Feature Page)

| Property | Value |
|----------|-------|
| **Type** | Dynamic (ƒ) |
| **File** | `src/app/process/[id]/page.tsx` |
| **Components** | `FlowMap` (dynamic), `SwimLaneMap` (dynamic), `AnalysisPanel`, `ComparisonTable`, `ExportButton` (dynamic), `VersionHistory`, `HealthScoreGauge`, `SmartSuggestions`, `ErrorBoundary`, `ProcessChat` (dynamic), `ROICalculator` (dynamic), `AuditTrail` (dynamic), `ApprovalWorkflow` (dynamic) |
| **Data Source** | IndexedDB via `useProcess(id)` hook, `updateLastViewed()` |
| **Key Interactions** | Switch optimization tabs, toggle flowchart/swimlane view, right panel tabs (Map/ROI/History/Audit), share link copy, collaborate link copy, export PNG/PDF, AI chat (side panel), restore version, approval workflow actions, smart suggestion clicks → chat |
| **Empty State** | Loading spinner → "Process not found" with back-to-dashboard link |
| **Error State** | Dedicated `error.tsx` with retry + back-to-dashboard. `ErrorBoundary` wraps major sections. |
| **First Load JS** | 99.9 kB |
| **Notes** | The richest page. 7 dynamically-loaded components. Two view modes (flowchart + swimlane). Four right-panel tabs. |

---

### 13. `/share/[id]` — Read-Only Share View

| Property | Value |
|----------|-------|
| **Type** | Dynamic (ƒ) |
| **File** | `src/app/share/[id]/page.tsx` |
| **Components** | `FlowMap` (dynamic), `ComparisonTable` |
| **Data Source** | IndexedDB via `useProcess(id)`, `getLayoutedElements()` |
| **Key Interactions** | Tab between current state and optimization options, view flow map (non-interactive), view comparison table, "Open Full View" link to `/process/[id]` |
| **Empty State** | "Process not found" — "This shared link may be invalid or the process has been removed." |
| **Error State** | Same as empty state |
| **First Load JS** | 108 kB |
| **Notes** | Clean header with FlowForge branding. No nav bar. Note: sharing only works if the viewer has the same IndexedDB data (same browser) — no server-side sharing. |

---

### 14. `/collaborate/[id]` — Collaboration View

| Property | Value |
|----------|-------|
| **Type** | Dynamic (ƒ) |
| **File** | `src/app/collaborate/[id]/page.tsx` |
| **Components** | `FlowMap` (dynamic), `ComparisonTable` |
| **Data Source** | IndexedDB via `useProcess(id)`, `saveFeedback()`, `getFeedback()` |
| **Key Interactions** | View process (like share), toggle feedback panel (`?feedback=true`), submit feedback (author + comment), view feedback history, health score display |
| **Empty State** | "Process not found" with back-to-dashboard link |
| **Error State** | Same as empty state |
| **First Load JS** | 110 kB |
| **Notes** | Feedback stored in IndexedDB `feedback` store. Same browser limitation as `/share/[id]`. |

---

### 15. `/api/ai/analyze` — AI Analysis Endpoint

| Property | Value |
|----------|-------|
| **Type** | API Route (ƒ) |
| **File** | `src/app/api/ai/analyze/route.ts` |
| **Method** | POST |
| **Input** | `{ currentProcess: string, desiredOutcome: string, industry: string, goals?: string[] }` |
| **Output** | `{ title, currentState: { steps, bottlenecks }, options: [...], comparison: [...] }` |
| **Dependencies** | `MOONSHOT_API_KEY` env var, Moonshot API (`moonshot-v1-8k` model) |
| **Error States** | 400 (invalid input), 500 (missing key, empty response, invalid JSON), 502 (Moonshot API error) |
| **Notes** | `maxDuration: 60` for Vercel. Strips markdown code fences from AI response. Temperature: 0.7. |

---

### 16. `/api/ai/chat` — AI Chat Endpoint

| Property | Value |
|----------|-------|
| **Type** | API Route (ƒ) |
| **File** | `src/app/api/ai/chat/route.ts` |
| **Method** | POST |
| **Input** | `{ message: string, analysisContext?: AnalysisResult, chatHistory?: ChatMessage[] }` |
| **Output** | `{ reply: string, hasProcessUpdate: boolean, updatedOption?: { name, description, improvement, steps } }` |
| **Dependencies** | `MOONSHOT_API_KEY` env var, Moonshot API (`moonshot-v1-8k` model) |
| **Error States** | 400 (empty message), 500 (missing key, empty response), 502 (Moonshot error) |
| **Notes** | Sends last 3 chat messages as context. Can return process updates that the client applies. |

---

### 17. `/api/auth/login` — Auth Endpoint

| Property | Value |
|----------|-------|
| **Type** | API Route (ƒ) |
| **File** | `src/app/api/auth/login/route.ts` |
| **Method** | POST |
| **Input** | `{ password: string }` |
| **Output** | `{ success: true }` + `ff_session` httpOnly cookie (7-day expiry) |
| **Dependencies** | `ACCESS_PASSWORD` env var |
| **Error States** | 400 (missing password), 401 (wrong password), 500 (env not configured) |
| **Notes** | **Currently unused** — middleware auth is disabled. Cookie value is static string "authenticated". |

---

## Error Handling Pages

| File | Scope | Description |
|------|-------|-------------|
| `src/app/error.tsx` | App-level | Generic error with retry + home link |
| `src/app/global-error.tsx` | Root-level | Nuclear recovery — deletes IndexedDB databases on retry |
| `src/app/process/[id]/error.tsx` | Process page | Error with retry + back-to-dashboard link |

---

## Build Summary

| Route | Size | First Load JS | Type |
|-------|------|---------------|------|
| `/` | 3.61 kB | 91.8 kB | ○ Static |
| `/analytics` | 3.1 kB | 91.3 kB | ○ Static |
| `/collaborate/[id]` | 7.91 kB | 110 kB | ƒ Dynamic |
| `/dashboard` | 3.17 kB | 95.4 kB | ○ Static |
| `/demo` | 6.42 kB | 94.6 kB | ○ Static |
| `/executive` | 7.76 kB | 95.9 kB | ○ Static |
| `/library` | 6.95 kB | 95.1 kB | ○ Static |
| `/login` | 1.7 kB | 89.8 kB | ○ Static |
| `/new` | 8.28 kB | 96.4 kB | ○ Static |
| `/org-dashboard` | 8.44 kB | 96.6 kB | ○ Static |
| `/process/[id]` | 7.61 kB | 99.9 kB | ƒ Dynamic |
| `/settings` | 3.31 kB | 91.5 kB | ○ Static |
| `/share/[id]` | 5.91 kB | 108 kB | ƒ Dynamic |
| `/templates` | 5.07 kB | 93.2 kB | ○ Static |
| **Shared JS** | — | **88.2 kB** | — |
| **Middleware** | — | **26.5 kB** | — |

---

*Captured from `npm run build` output on 2026-02-06.*
