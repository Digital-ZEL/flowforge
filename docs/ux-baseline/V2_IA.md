# FlowForge V2 — Information Architecture

**Date:** February 6, 2026  
**Status:** Proposed  
**Replaces:** V1 navigation (8 top-level items)

---

## Current State: Navigation Audit

### Desktop Nav (8 items)
```
[Logo/Home] ---- Library | Templates | Dashboard | Org Analytics | Executive | Settings ---- [+ New Process]
```

### Mobile Bottom Nav (6 items)
```
Home | Dashboard | Library | Templates | Executive | Settings
```

### Problems
1. **Too many top-level items.** Users face choice paralysis. Industry standard for SaaS nav is 4-6 items.
2. **Overlapping concepts:** Dashboard ≈ Library (same data, different views). Org Analytics ≈ Executive (overlapping metrics).
3. **Unclear hierarchy:** Templates is a utility, not a destination. Settings doesn't warrant top-level placement.
4. **Missing primary action in mobile nav:** "Create New" is absent from bottom nav — the #1 user task.
5. **No grouping signal:** All 8 items are visually equal weight.

---

## V2 Proposed Navigation

### Primary Navigation (always visible)

```
[Logo] ---- Processes | Insights ---- [+ Create]  ---- [⚙ Settings icon]
```

| Item | Route | Contains | Replaces |
|------|-------|----------|----------|
| **Processes** | `/processes` | Library (grid/list), search, filters, templates tab | `/dashboard` + `/library` + `/templates` |
| **Insights** | `/insights` | Executive metrics, department health, risk matrix, cost calculator, compliance, activity | `/executive` + `/org-dashboard` + `/analytics` |
| **+ Create** | `/new` | Guided wizard (unchanged) | `/new` |
| **Settings** | `/settings` | Icon-only in nav. Data management, preferences | `/settings` |

### Why This Works
- **3 destinations** + 1 action + 1 utility = 5 total, down from 8.
- **Processes** is where you manage work. **Insights** is where you see the big picture. **Create** is the primary action. Clean mental model.
- Templates don't need their own page — they're a filter/tab within Processes.
- Analytics usage data can fold into a small section within Insights (or Settings).

### Mobile Bottom Nav (4 items)

```
[Processes] ---- [+ Create] ---- [Insights] ---- [Settings]
```

- **Create** gets center position with accent styling (FAB-like).
- Reduced from 6 items to 4 — within usability guidelines.
- Home/Landing page accessible from logo only (not a nav item — logged-in users don't need it).

---

## Page Consolidation Map

### `/processes` — Unified Process Management

**Merges:** `/dashboard` + `/library` + `/templates`

```
┌─────────────────────────────────────────────────┐
│  Processes                          [+ Create]  │
│                                                 │
│  [Search bar ___________________________]       │
│                                                 │
│  [All] [My Processes] [Templates] [Archived]    │ ← Tab row
│                                                 │
│  Filters: [Department ▼] [Status ▼] [Sort ▼]   │
│  View:    [Grid] [List] [Kanban]                │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Process  │  │ Process  │  │ Process  │      │
│  │ Card     │  │ Card     │  │ Card     │      │
│  │          │  │          │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                 │
│  Recently Viewed (collapsed section)            │
│  Quick Stats (total, avg health, bottlenecks)   │
└─────────────────────────────────────────────────┘
```

**Tabs explained:**
- **All:** Every process in the system (current Library view).
- **My Processes:** Processes owned by / created by current user. Replaces Dashboard's "your saved process maps" framing.
- **Templates:** Industry templates. One click to "Use Template" (opens pre-filled wizard). Replaces standalone `/templates` page.
- **Archived:** Soft-deleted processes. Enables undo/restore.

**View modes:**
- **Grid:** Visual cards with health gauge (current Library grid view).
- **List:** Dense rows for scanning many processes (current Library list view).
- **Kanban:** Columns by status (Draft → In Review → Approved → Needs Update). New for V2 — maps naturally to the approval workflow.

---

### `/insights` — Organizational Intelligence

**Merges:** `/executive` + `/org-dashboard` + `/analytics`

```
┌─────────────────────────────────────────────────┐
│  Organizational Intelligence         Feb 6, 2026│
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│  │ Total   │ │ Health  │ │ Annual  │ │Compli-││
│  │ Processes│ │ Score   │ │ Cost    │ │ance   ││
│  │   24    │ │  72/100 │ │ $480K   │ │  85%  ││
│  └─────────┘ └─────────┘ └─────────┘ └───────┘│
│                                                 │
│  ┌──────────────────┐  ┌───────────────────┐   │
│  │ Process Health   │  │ Risk Matrix       │   │
│  │ Grid (tiles)     │  │ (likelihood×impact)│   │
│  │                  │  │                   │   │
│  └──────────────────┘  └───────────────────┘   │
│                                                 │
│  ┌──────────────────┐  ┌───────────────────┐   │
│  │ Department       │  │ Action Items      │   │
│  │ Performance      │  │ (needs attention) │   │
│  │ (bar chart)      │  │                   │   │
│  └──────────────────┘  └───────────────────┘   │
│                                                 │
│  ┌──────────────────┐  ┌───────────────────┐   │
│  │ Compliance       │  │ Cost Calculator   │   │
│  │ Summary (donut)  │  │ (savings model)   │   │
│  └──────────────────┘  └───────────────────┘   │
│                                                 │
│  ▸ Usage Analytics (collapsed — optional)       │
└─────────────────────────────────────────────────┘
```

**Section priority (top to bottom):**
1. Hero metrics (4 cards) — instant pulse check
2. Process Health Grid + Risk Matrix — "where are the problems?"
3. Department Performance + Action Items — "what needs attention?"
4. Compliance Summary + Cost Calculator — "are we on track and what does it cost?"
5. Usage Analytics (collapsed) — niche, only for admins

---

### `/process/[id]` — Process Detail (Reorganized)

**Current problem:** Left panel is overloaded (7 stacked sections). Secondary tab bar appears mid-panel.

**V2 layout:**

```
┌─────────────────────────────────────────────────┐
│  ← Processes    Client Onboarding   [Share] [Export]│
│  Wealth Management · Feb 5, 2026    [💬 Chat]  │
│                                                 │
│  [Overview] [Compare] [ROI] [History] [Audit]   │ ← Single tab bar
│                                                 │
│  ┌──────────────────────┬───────────────────┐   │
│  │  Health Score: 62    │                   │   │
│  │  ┌─Bottleneck─┐      │   FLOW MAP        │   │
│  │  │  Score: 45 │      │   (or Swimlane)   │   │
│  │  ├─Handoffs───┤      │                   │   │
│  │  │  Score: 70 │      │   [Flowchart|     │   │
│  │  ├─Length─────┤      │    Swimlane]      │   │
│  │  │  Score: 55 │      │                   │   │
│  │  └────────────┘      │                   │   │
│  │                      │                   │   │
│  │  Status: In Review   │                   │   │
│  │  [Approve] [Request] │                   │   │
│  │                      │                   │   │
│  │  💡 Quick Wins       │                   │   │
│  │  • Automate KYC...   │                   │   │
│  │  • Parallel review...│                   │   │
│  └──────────────────────┴───────────────────┘   │
│                                                 │
│  Option Tabs: [Current State] [Digital-First]   │
│               [Hybrid Concierge] [Phased Auto]  │
└─────────────────────────────────────────────────┘
```

**Key changes:**
- Single top-level tab bar (Overview, Compare, ROI, History, Audit) replaces confusing dual tab system.
- **Overview tab** = Health Score + Map + Quick Wins + Approval Status. Everything a user needs at a glance.
- **Compare tab** = Comparison table + option switching. Currently buried at the bottom.
- **ROI tab** = ROI Calculator (unchanged).
- **History tab** = Version History (unchanged).
- **Audit tab** = Audit Trail (unchanged).
- Breadcrumb navigation: `Processes > Client Onboarding` — makes it easy to get back.
- Option tabs (Current State / Option 1 / 2 / 3) stay in the Overview tab, controlling which flow map is displayed.

---

## User Flow Diagrams

### Flow 1: Create and Analyze a New Process

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Any Page │───→│ Click    │───→│ Step 1:  │───→│ Step 2:  │───→│ Step 3:  │
│          │    │ [+Create]│    │ Industry │    │ Describe │    │ Goals    │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                     │
                                                                     ▼
┌─────────┐    ┌──────────┐    ┌──────────┐
│ Process  │←──│ AI       │←──│ Step 4:  │
│ Detail   │   │ Analysis │    │ Review & │
│ Page     │   │ (15-30s) │    │ Submit   │
└─────────┘    └──────────┘    └──────────┘
```

**Clicks:** 1 (Create) + 1 (Industry) + 0 (type description) + 1 (Continue) + 1 (Continue) + 1 (Analyze) = **5 clicks + typing**  
**Time:** ~60-90 seconds typing + 20-40 seconds AI = **~2 minutes total**

**V2 improvements:**
- Autosave drafts so users can resume
- Optional: Quick create (skip wizard, just paste text + auto-detect industry)
- Background analysis with notification (user can navigate away)

---

### Flow 2: Review and Approve a Process

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Processes│───→│ Filter:  │───→│ Click    │───→│ Review   │
│ Page     │    │ Status = │    │ Process  │    │ Health,  │
│          │    │ "In      │    │ Card     │    │ Map,     │
│ (or)     │    │  Review" │    │          │    │ Details  │
│ Insights │    │          │    │          │    │          │
│ Action   │    │          │    │          │    │          │
│ Items    │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                              ┌──────┴──────┐
                                              ▼             ▼
                                        ┌──────────┐  ┌──────────┐
                                        │ Approve  │  │ Request  │
                                        │ (1 click)│  │ Changes  │
                                        │          │  │ (comment │
                                        │          │  │ + click) │
                                        └──────────┘  └──────────┘
```

**Clicks:** 1 (filter or click action item) + 1 (select process) + 1 (approve/reject) = **3 clicks**  
**Time:** ~30 seconds to review + 1 click = **~1 minute**

**V2 improvements:**
- Kanban view on Processes page: drag card from "In Review" to "Approved" column
- Batch approve: select multiple processes → approve all
- Insights page "Action Items" section links directly to processes needing review

---

### Flow 3: View Organizational Health

```
┌──────────┐    ┌──────────────────────────────────────────┐
│ Any Page │───→│ Click "Insights" in nav                  │
│          │    │                                          │
│          │    │  ┌─────────────────────────────────────┐ │
│          │    │  │ Hero Metrics: Health 72 | Cost $480K│ │
│          │    │  └─────────────────────────────────────┘ │
│          │    │  ┌──────────────┐  ┌──────────────────┐ │
│          │    │  │ Health Grid  │  │ Risk Matrix      │ │
│          │    │  │ (click any   │  │ (click any dot   │ │
│          │    │  │  tile →      │  │  → process)      │ │
│          │    │  │  process     │  │                  │ │
│          │    │  │  detail)     │  │                  │ │
│          │    │  └──────────────┘  └──────────────────┘ │
│          │    │  ┌──────────────┐  ┌──────────────────┐ │
│          │    │  │ Dept Perf.   │  │ Action Items     │ │
│          │    │  └──────────────┘  │ (click → process)│ │
│          │    │                    └──────────────────┘ │
│          │    └──────────────────────────────────────────┘
└──────────┘
```

**Clicks:** 1 (Insights) = **1 click** to see full organizational health  
**Time:** Entire dashboard loads in <0.5s. **Instant.**

**V2 improvements:**
- Every metric/tile/dot is clickable → drills into the relevant process
- "Action Items" section surfaces the most urgent items
- Collapsible sections let executives customize their view density
- Print/Export entire dashboard as PDF for board presentations

---

## Route Migration Plan

| V1 Route | V2 Route | Action |
|----------|----------|--------|
| `/` | `/` | Keep (landing page for unauthenticated) |
| `/dashboard` | `/processes` | **Redirect** → `/processes?tab=my` |
| `/library` | `/processes` | **Redirect** → `/processes?tab=all` |
| `/templates` | `/processes` | **Redirect** → `/processes?tab=templates` |
| `/executive` | `/insights` | **Redirect** → `/insights` |
| `/org-dashboard` | `/insights` | **Redirect** → `/insights` |
| `/analytics` | `/insights` | **Merge** into Insights (collapsed section) |
| `/new` | `/new` | Keep (wizard unchanged) |
| `/process/[id]` | `/process/[id]` | **Reorganize** (new tab structure) |
| `/share/[id]` | `/share/[id]` | Keep |
| `/collaborate/[id]` | `/collaborate/[id]` | Keep |
| `/settings` | `/settings` | Keep (icon-only in nav) |
| `/login` | `/login` | Keep (for future auth) |
| `/demo` | `/demo` | Keep |

**Total routes:** 17 → 13 (4 become redirects)  
**Top-level nav items:** 8 → 3 + 1 action + 1 utility = 5

---

## Information Hierarchy Summary

```
FlowForge V2
├── Processes (primary)
│   ├── All Processes (grid/list/kanban)
│   ├── My Processes (personal filter)
│   ├── Templates (pre-built starters)
│   └── Archived (soft-deleted)
├── Insights (primary)
│   ├── Hero Metrics
│   ├── Health Grid
│   ├── Risk Matrix
│   ├── Department Performance
│   ├── Action Items
│   ├── Compliance Summary
│   ├── Cost Calculator
│   └── Usage Analytics (collapsed)
├── + Create (primary action)
│   └── Guided Wizard (4 steps)
├── Process Detail (drill-down)
│   ├── Overview (health + map + suggestions + approval)
│   ├── Compare (options + comparison table)
│   ├── ROI Calculator
│   ├── History
│   └── Audit Trail
└── Settings (utility)
    ├── Data Management
    ├── Preferences (future)
    └── Account (future)
```
