# FlowForge Legacy UI Baseline

> **Snapshot date:** 2026-02-06  
> **Commit:** b4c3709 (`docs: FlowForge v5 product writeup`)  
> **Version:** 0.1.0 (v5 — Enterprise features)  
> **Production URL:** https://flowforge-three.vercel.app  
> **Stack:** Next.js 14.2.29, React 18.3.1, Tailwind CSS 3.4.17, TypeScript 5.7.3

---

## Table of Contents
1. [Application Overview](#application-overview)
2. [All 17 Routes](#all-17-routes)
3. [Navigation Structure](#navigation-structure)
4. [UI Patterns](#ui-patterns)
5. [Design Tokens](#design-tokens)
6. [Known Quirks & Issues](#known-quirks--issues)
7. [Run Instructions](#run-instructions)
8. [Environment Variables](#environment-variables)

---

## Application Overview

FlowForge is an AI-powered business process mapping tool. Users describe a workflow in plain English, and AI (Moonshot/Kimi) generates:
- A structured process map (interactive React Flow diagram)
- Bottleneck identification
- 3 optimization options with comparison metrics
- Health scores, ROI calculations, and collaboration features

Data is stored **entirely client-side** in IndexedDB (`idb` library). No server database. The only server-side logic is the AI API proxy (Moonshot) and a simple password auth endpoint (currently disabled).

---

## All 17 Routes

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/` | Static | **Landing page** — Hero section, before/after comparison, feature grid, CTA buttons |
| 2 | `/new` | Static | **New Process wizard** — Multi-step form: industry select → process description → goals → AI analysis |
| 3 | `/dashboard` | Static | **Personal dashboard** — Process list with quick stats, search, delete, suggested next steps |
| 4 | `/library` | Static | **Process library** — Grid/list view with search, department filter, sort options, health score badges |
| 5 | `/templates` | Static | **Template gallery** — 6 wealth management templates with tag filtering |
| 6 | `/executive` | Static | **Executive dashboard** — KPI metric cards, donut charts, health score grid, process distribution |
| 7 | `/org-dashboard` | Static | **Organization analytics** — Department breakdown, risk matrix, cost calculator, recent activity |
| 8 | `/analytics` | Static | **Usage analytics** — Local analytics from IndexedDB (page views, exports, chat messages, industry usage) |
| 9 | `/settings` | Static | **Settings** — Data export/import (JSON backup), storage usage, clear all data |
| 10 | `/login` | Static | **Login page** — Simple password gate (currently disabled via middleware) |
| 11 | `/demo` | Static | **Demo mode** — Auto-loads a pre-built "Client Onboarding" demo process |
| 12 | `/process/[id]` | Dynamic | **Process detail** — Full process view: flow map, swim lanes, analysis panel, comparison table, chat, ROI, versions, audit trail, approval workflow, smart suggestions, export |
| 13 | `/share/[id]` | Dynamic | **Read-only share** — Clean view for sharing: flow map + comparison table, no editing |
| 14 | `/collaborate/[id]` | Dynamic | **Collaboration view** — Shared view with feedback/comments feature |
| 15 | `/api/ai/analyze` | API | AI analysis endpoint (POST) — Sends to Moonshot, returns structured JSON |
| 16 | `/api/ai/chat` | API | AI chat endpoint (POST) — Conversational process refinement |
| 17 | `/api/auth/login` | API | Auth endpoint (POST) — Password verification, sets httpOnly cookie |

**Build classification:**
- **Static (○):** 12 pages pre-rendered at build time
- **Dynamic (ƒ):** 3 pages (`/process/[id]`, `/share/[id]`, `/collaborate/[id]`) + 3 API routes
- **Middleware:** Auth guard (currently disabled — `matcher: []`)

---

## Navigation Structure

### Desktop Navigation (≥640px)
Sticky top bar (`h-14`) with frosted glass effect (`bg-white/80 backdrop-blur-md`):

```
[⚡ FlowForge]    [Library] [Templates] [Dashboard] [Org Analytics] [Executive] [Settings]    [+ New Process]
```

- Logo links to `/`
- "New Process" is a primary CTA button (brand-600 bg, white text)
- All links are plain text with hover color transitions

### Mobile Navigation (<640px)

**Top bar** (`h-12`): Compact logo + "New" CTA button only.

**Bottom nav** (fixed, `h-14`): 6-item icon-based navigation:
```
[Home] [Dashboard] [Library] [Templates] [Executive] [Settings]
```
- Active state: `text-brand-600` / `text-brand-400` (dark)
- Inactive: `text-slate-400` / `text-slate-500` (dark)
- iOS safe area padding via `env(safe-area-inset-bottom)`

### Navigation Gaps
- `/analytics` and `/org-dashboard` are **not in mobile nav** (accessible only via desktop or direct URL)
- `/login`, `/demo` are unlisted in navigation
- `/share/[id]` and `/collaborate/[id]` are link-only (generated from process detail page)

---

## UI Patterns

### Forms
- **Multi-step wizard** (`/new`): Industry select (radio cards) → Textarea input with industry-specific placeholder → Goal chips (multi-select) → AI processing animation
- **Login form** (`/login`): Single password field + submit
- **Settings form** (`/settings`): Action buttons (export, import file picker, clear data with confirmation)
- **Feedback form** (`/collaborate/[id]`): Author name + comment textarea

### Cards
- **Process cards** (`/dashboard`): White card with health gauge, title, industry badge, step count, time ago, suggested action
- **Library cards** (`LibraryCard`): Grid or list mode, mini health gauge, department badge, status badge, owner tag
- **Template cards** (`/templates`): Icon, title, description, industry tag, "Use Template" CTA
- **Stat cards** (`QuickStats`, `StatCard`): Large number + label + icon, used across analytics pages
- **Executive metric cards** (`ExecutiveMetrics`): Gradient backgrounds, icon circles, trend indicators, optional gauge rings

### Flow Maps
- **Interactive FlowMap** (`FlowMap.tsx`): React Flow with dagre layout, zoom/pan, minimap, dot grid background
- **SwimLaneMap** (`SwimLaneMap.tsx`): Role-based swim lanes with colored lane headers, auto-role detection from step labels
- **Custom node types**: StartNode (green pill), ProcessNode (blue rect), DecisionNode (amber rotated diamond), HandoffNode (purple with transfer icon), BottleneckNode (red dashed border, pulsing animation), EndNode (slate pill)

### Charts & Gauges
- **Health score gauge** (`HealthScoreGauge`, `GaugeCircle`): SVG donut with animated stroke-dashoffset, score breakdowns (bottleneck, handoff, length, decision)
- **Mini gauge** (`MiniGauge` in LibraryCard): 44px variant for list items
- **Executive gauge ring** (`GaugeRing` in ExecutiveMetrics): 96px with color-coded thresholds
- **Donut chart** (`DonutChart` in executive page): SVG segments with legends
- **Bar charts** (`BarChart` in analytics, `DepartmentBreakdown` in org-dashboard): CSS-based horizontal bars
- **Risk matrix** (`RiskMatrix`): 5×5 grid with color zones (green/yellow/red/darkred), interactive hover with tooltips
- **Animated counters** (`AnimatedCounter` in OrgMetrics): Ease-out number animation over 1.2s

### Modals & Overlays
- **PDF export modal** (in `ExportButton`): Company name input before PDF generation
- **Clear data confirmation** (`/settings`): Inline confirmation with cancel
- **Chat panel** (`ProcessChat`): Fixed-position overlay (`w-[400px]`, full-screen on mobile), slide-up animation
- **Welcome toast** (`WelcomeToast`): Fixed bottom-left, auto-dismiss on first visit

### Toasts
- **Toast system** (`Toast.tsx`): Context-based provider, 3 types (success/error/info), auto-dismiss at 5s
- Colors: success=emerald, error=red, info=blue
- Positioned fixed bottom-right with slide-up animation

### Tabs
- **Analysis tabs** (`AnalysisPanel`): "Current State" + optimization option names, brand-600 active, slate-100 inactive
- **View mode tabs** (process page): Flowchart/Swimlane toggle
- **Right panel tabs** (process page): Map / ROI / History / Audit
- **Tag filter tabs** (`/templates`, `/library`): Pill-style filter buttons

### Tables
- **Comparison table** (`ComparisonTable`): Responsive table with metric rows, hover highlighting
- **Version history** (`VersionHistory`): Timeline-style cards with restore buttons
- **Audit trail** (`AuditTrail`): Filtered timeline with action type badges, export to clipboard

### Other Patterns
- **Approval workflow** (`ApprovalWorkflow`): Status stepper (Draft → In Review → Approved), comment field, history toggle
- **Smart suggestions** (`SmartSuggestions`): Category-colored action cards that open chat with pre-filled prompts
- **ROI calculator** (`ROICalculator`): Input sliders + calculated savings table + 3-year projection
- **Cost calculator** (`CostCalculator`): Organization-wide cost estimation with optimization slider
- **Export button** (`ExportButton`): PNG (html-to-image) + PDF (jsPDF) export with company branding
- **Error boundary** (`ErrorBoundary`): Component-level catch with retry button and error details
- **Loading shimmer**: CSS gradient animation for skeleton loading states
- **Progress indicator** (`/new`): Step-by-step AI processing animation with pulsing icon

---

## Design Tokens

### Colors

#### Brand (Indigo scale)
```
brand-50:  #eef2ff    brand-500: #6366f1    brand-900: #312e81
brand-100: #e0e7ff    brand-600: #4f46e5    brand-950: #1e1b4b
brand-200: #c7d2fe    brand-700: #4338ca
brand-300: #a5b4fc    brand-800: #3730a3
brand-400: #818cf8
```

#### Slate (used for text, borders, backgrounds)
Standard Tailwind slate scale: `slate-50` through `slate-950`.

#### Status Colors
| Status | Light | Dark |
|--------|-------|------|
| Success / Approved | `emerald-*` | `emerald-*` |
| Warning / At Risk | `amber-*` | `amber-*` |
| Error / Critical | `red-*` | `red-*` |
| Info / In Review | `blue-*` / `yellow-*` | `blue-*` / `yellow-*` |
| Handoff | `purple-*` | `purple-*` |
| Needs Update | `orange-*` | `orange-*` |

#### Node Colors (Flow Map)
| Node Type | Background | Border |
|-----------|-----------|--------|
| Start | `emerald-50` | `emerald-500` (2px) |
| Process | `blue-50` | `blue-400` (2px) |
| Decision | `amber-50` | `amber-400` (2px) |
| Handoff | `purple-50` | `purple-400` (2px) |
| Bottleneck | `red-50` | `red-400` (2px dashed) |
| End | `slate-100` | `slate-400` (2px) |

#### Swim Lane Colors (10 roles)
```
Advisor:    bg=#eef2ff  border=#c7d2fe
Compliance: bg=#fef2f2  border=#fecaca
Operations: bg=#f0fdf4  border=#bbf7d0
Client:     bg=#fffbeb  border=#fde68a
Partner:    bg=#faf5ff  border=#e9d5ff
System:     bg=#f0f9ff  border=#bae6fd
Trading:    bg=#fff7ed  border=#fed7aa
Finance:    bg=#ecfdf5  border=#a7f3d0
Analytics:  bg=#fdf4ff  border=#f5d0fe
Management: bg=#f8fafc  border=#cbd5e1
```

### Typography

**Font Family:**
```css
font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
```
- Loaded via Google Fonts: `Inter:wght@300;400;500;600;700;800`
- Anti-aliased rendering (`-webkit-font-smoothing: antialiased`)

**Sizes used in codebase** (Tailwind classes):
| Class | Use |
|-------|-----|
| `text-xs` (12px) | Labels, badges, subtitles, timestamps |
| `text-sm` (14px) | Body text, nav links, form inputs, cards |
| `text-base` (16px) | Larger body text, some headings |
| `text-lg` (18px) | Section headings, panel titles |
| `text-xl` (20px) | Page sub-headings |
| `text-2xl` (24px) | Stat numbers, metric values |
| `text-3xl` (30px) | Page titles |
| `text-5xl` (48px) | Hero heading (desktop) |
| `text-6xl` (60px) | Hero heading (lg desktop) |

**Weights:**
| Weight | Class | Usage |
|--------|-------|-------|
| 300 | `font-light` | Minimal use |
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Buttons, nav links, emphasis |
| 600 | `font-semibold` | Section headings, stats labels |
| 700 | `font-bold` | Page titles, logo, stat numbers |
| 800 | `font-extrabold` | Hero heading only |

### Spacing Scale
Standard Tailwind spacing used. Most common patterns:
- `p-4` / `p-5` / `p-6` — Card padding
- `gap-2` / `gap-3` / `gap-4` — Flex/grid gaps  
- `space-y-2` / `space-y-3` / `space-y-6` — Vertical stacking
- `mb-4` / `mb-6` / `mb-8` / `mb-10` — Section margins
- `max-w-7xl` — Main content container
- `max-w-5xl` / `max-w-6xl` — Narrower content pages
- `px-4 sm:px-6 lg:px-8` — Responsive horizontal padding

### Border Radii
| Pattern | Usage |
|---------|-------|
| `rounded-lg` (8px) | Buttons, input fields, small cards |
| `rounded-xl` (12px) | Cards, panels, containers |
| `rounded-2xl` (16px) | Large cards, modals, chat panel |
| `rounded-full` | Pills, badges, avatars, gauges |

### Shadows
| Class | Usage |
|-------|-------|
| `shadow-sm` | Buttons, small elevation |
| `shadow-md` | Card hover state |
| `shadow-lg` | Toasts, dropdowns, hover cards |
| `shadow-xl` | Welcome toast, modals |
| `shadow-brand-500/25` | Hero CTA glow effect |

### Dark Mode
- Triggered by `class` strategy (`darkMode: 'class'`)
- Base: `bg-white` → `bg-slate-950`, `text-slate-900` → `text-slate-100`
- Cards: `bg-white` → `bg-slate-900`
- Borders: `border-slate-200` → `border-slate-800`
- Frosted glass: `bg-white/80` → `bg-slate-950/80`

### Custom Animations
| Name | Duration | Usage |
|------|----------|-------|
| `shimmer` | 1.5s ease-in-out infinite | Loading skeleton |
| `pulse-ring` | 2s ease-in-out infinite | Active step indicator |
| `slide-up` | 0.4s ease-out | Toast entrance |
| `fade-in-up` | 0.6s ease-out | Landing page stagger |
| `score-fill` | — | Health gauge stroke animation |
| `animate-spin` | — | Loading spinners |
| `animate-ping` | — | AI processing indicator |
| Stagger delays | 100ms–500ms | Landing page cards |

---

## Known Quirks & Issues

1. **Auth is disabled** — Middleware matcher is empty (`matcher: []`), so `/login` exists but is never enforced. The `ACCESS_PASSWORD` env var route exists but is dead code in production.

2. **Data is client-side only** — All process data lives in IndexedDB. No sync, no multi-device. Clearing browser data loses everything. The `/settings` export/import is the only backup mechanism.

3. **Chat panel mobile override** — CSS `!important` override in globals.css forces the chat panel to full-screen on mobile by targeting a specific class combination (`.fixed.bottom-6.right-6.z-50.w-\[400px\]`). Fragile if class names change.

4. **React Flow SSR** — FlowMap, SwimLaneMap, ProcessChat, ExportButton, ROICalculator, AuditTrail, and ApprovalWorkflow are all loaded with `dynamic(() => import(...), { ssr: false })` to avoid hydration mismatches.

5. **Demo process hardcoded** — `/demo` has a full 13-step process with 3 optimization options hardcoded directly in the page file (~200 lines of data).

6. **IndexedDB corruption recovery** — `global-error.tsx` includes a nuclear option: `indexedDB.deleteDatabase('flowforge')` on any unhandled error.

7. **Moonshot API dependency** — AI features require `MOONSHOT_API_KEY`. If the key is missing, AI analysis and chat both return 500 errors. No fallback model.

8. **Rate limiting is per-instance** — The `rateLimit.ts` uses an in-memory Map, which resets on every Vercel cold start. Provides minimal protection.

9. **No real authentication** — The `ff_session` cookie is a static string `"authenticated"` with no token rotation, user identity, or session management.

10. **`/process/[id]` is the heaviest route** — First Load JS of 99.9 kB due to React Flow + multiple dynamic components.

11. **Comparison table not responsive** — Uses a standard `<table>` with `overflow-x-auto`, which works but isn't mobile-optimized.

12. **Health score inconsistency** — Two different health score calculation functions exist: `calculateHealthScore` in `healthScore.ts` (weighted subscores) and `computeExecutiveHealth` in `executive/page.tsx` (simpler deduction model). They produce different scores for the same process.

13. **Accessibility** — Focus indicators are implemented (`*:focus-visible` outline), minimum touch targets are enforced on mobile (44px), but no ARIA landmarks, skip-nav links, or screen reader testing has been done.

---

## Run Instructions

### Prerequisites
- Node.js v18+ (tested with v22.22.0)
- npm

### Development
```bash
cd /home/digit/clawd/projects/flowforge
npm install
npm run dev
# → http://localhost:3000
```

### Production Build
```bash
npm run build   # Generates optimized static + dynamic pages
npm run start   # Serves production build locally
```

### Tests
```bash
npm run test    # vitest run (parser, templates, validation, db, rateLimit tests)
```

### Lint
```bash
npm run lint    # next lint
```

### Deploy
Deployed to Vercel. Push to main triggers auto-deploy.
```bash
vercel --yes --prod
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MOONSHOT_API_KEY` | **Yes** (for AI features) | Moonshot/Kimi API key. Used by `/api/ai/analyze` and `/api/ai/chat` |
| `ACCESS_PASSWORD` | No (auth disabled) | Password for `/api/auth/login` endpoint |
| `NODE_ENV` | Auto | Set by Next.js; controls cookie `secure` flag |

**`.env.example` exists** with `ANTHROPIC_API_KEY=` (legacy/placeholder — actual API uses Moonshot, not Anthropic).

---

*This document is the source-of-truth baseline for the FlowForge V5 legacy UI, captured before V2 modernization begins.*
