# FlowForge UX Audit — V1 Baseline

**Date:** February 6, 2026  
**Auditor:** UX Audit Agent (Swarm)  
**Version Audited:** v5.1  
**Production URL:** https://flowforge-three.vercel.app  
**Method:** Heuristic evaluation (Nielsen's 10 + custom SaaS criteria)  
**Source:** Full codebase review of 17 routes, 24 components, 12 library modules  

---

## 1. Clarity — Rating: 3/5

### Evidence

**Good:**
- Landing page hero is strong: "Map Any Business Process in 60 Seconds" — clear value proposition.
- The 3-step "How It Works" section (Describe → Analyze → Optimize) communicates the core flow well.
- `New Process` button is consistently placed in the top nav, visually prominent with brand color + icon.
- The 4-step wizard on `/new` has clear step indicators with descriptive subtitles per step.
- Process page tabs (Current State, Option 1, Option 2, Option 3) are scannable.

**Problems:**
- **Navigation overload:** Desktop nav exposes 8 items (Library, Templates, Dashboard, Org Analytics, Executive, Settings, + New Process, + Logo/Home). A new user can't tell the difference between Dashboard, Org Analytics, and Executive — all sound like dashboards.
- **Library vs Dashboard ambiguity:** `/dashboard` shows "Your saved process maps" while `/library` shows "Process Library — X processes across your organization." The distinction between personal vs organizational is not visually clear and the data source is the same IndexedDB.
- **Org Analytics vs Executive:** Both `/org-dashboard` and `/executive` show organizational health metrics, risk data, and department breakdowns. A user landing on either would think "this is the org dashboard." The "Operational Intelligence" title on `/executive` doesn't help disambiguate.
- **Templates page title** says "Industry Templates" but the templates are exclusively wealth management. The page subtitle hints at this but the primary heading oversells breadth.
- **Process detail page** is dense: left panel has Health Score, Analysis Panel (bottlenecks + tabs), Smart Suggestions, then a secondary tab row (Map/ROI/History/Audit), and below that the Approval Workflow. There's no visual hierarchy telling the user what to look at first.
- **Mobile nav** has 6 items (Home, Dashboard, Library, Templates, Executive, Settings) — too many for a bottom bar. Industry standard is 4-5 max.

### Recommendations
1. Reduce top-level navigation to 3 primary + 3 secondary (see V2_IA.md).
2. Merge Dashboard and Library into a single "Processes" page with personal/org toggle.
3. Merge Org Analytics into Executive as tabs or sections.
4. Add contextual page descriptions / onboarding tooltips for first-time visitors.
5. Create a clear visual hierarchy on the process detail page with collapsible sections.

---

## 2. Feedback — Rating: 2/5

### Evidence

**Good:**
- **Progress indicator during AI analysis** (`ProgressIndicator` component) — 4-step visual with animated spinner, estimated time, and step-by-step checkmarks. This is well-designed.
- **Toast system** exists (`ToastProvider`) with success/error/info variants, auto-dismiss, and dismiss button.
- **Loading shimmer** states on Library and Dashboard pages — cards skeleton while data loads.
- **Loading spinners** on most async pages (Executive, Org Dashboard, Analytics, Demo, Process).
- **Error boundary** component exists with retry button and error details disclosure.
- **Error state on process page** — clear "Process not found" message with link to Dashboard.

**Problems:**
- **No loading state on AI Chat send.** While there's a bounce animation, there's no typing indicator or estimated time. Chat responses take 3-10 seconds.
- **No feedback on "Copy Share Link" or "Copy Collaborate Link"** beyond a brief text change (Share → Copied!). No toast notification.
- **No feedback when saving process updates.** After applying a chat suggestion or changing approval status, the only feedback is the UI updating. No confirmation toast.
- **No inline validation on the process description textarea.** The minimum is 20 characters but there's only a small grey character count. No error message appears when trying to proceed with insufficient text — the Continue button is just disabled with no explanation.
- **Export button provides no progress feedback.** PDF generation can take several seconds; user gets no indication it's working until the download starts.
- **Settings page "Clear All Data"** has a confirmation modal (good), but no undo capability. The toast says "All data cleared. Reloading..." but a full page reload is jarring.
- **Template selection** navigates to `/new` with query params — no transition or loading state between clicking "Use Template" and the wizard appearing pre-filled.
- **ROI Calculator** inputs have no validation feedback. Entering 0 or negative numbers produces NaN or Infinity in calculations.
- **Approval Workflow** status changes show no intermediate loading state on the buttons. The `saving` state disables buttons but adds no spinner.
- **Offline handling:** No feedback when IndexedDB operations fail. If storage is full, operations silently fail.

### Recommendations
1. Add toast notifications for: save success, copy to clipboard, export complete, status changes.
2. Add inline validation messages under form fields (not just disabled buttons).
3. Add proper typing indicator to AI Chat with estimated wait time.
4. Add progress bar to PDF export.
5. Add input validation guards on ROI Calculator (min=1, integer-only).
6. Add loading spinners to Approval Workflow action buttons.
7. Add offline/error handling with user-facing messages.

---

## 3. Consistency — Rating: 3/5

### Evidence

**Good:**
- Color system is well-defined via Tailwind config: `brand` palette maps to indigo (50-950).
- Health score coloring is consistent across all usages: green (80+), yellow/amber (60-79), orange (40-59), red (<40).
- Card pattern is consistent: white bg, slate-200 border, rounded-xl/2xl, shadow-sm.
- Button primary style is consistent: `bg-brand-600 text-white hover:bg-brand-700 rounded-lg`.
- Typography: Inter font used globally, consistent heading sizes.
- Dark mode support is comprehensive across all pages.

**Problems:**
- **Button sizing inconsistency:** Primary CTAs use different padding across pages:
  - Landing: `px-8 py-4` (large)
  - Nav: `px-4 py-2` (medium)
  - Process page: `px-3 py-1.5` (small)
  - Library: `px-4 py-2` (medium)
  - Wizard: `px-6 py-2.5` (medium-large)
  No standard sizing system.
- **Border radius inconsistency:** 
  - Cards: `rounded-xl` (some), `rounded-2xl` (others)
  - Buttons: `rounded-lg` (most), `rounded-xl` (some like wizard, login)
  - Inputs: `rounded-xl` (wizard), `rounded-lg` (ROI calculator)
  - Modals: `rounded-2xl` always
- **Gradient usage:** Landing page uses `bg-gradient-to-r from-brand-600 to-purple-600` for primary CTAs. The wizard's "Analyze" button also uses this gradient. But all other buttons across the app use flat `bg-brand-600`. Inconsistent hierarchy signal.
- **Spacing patterns:** Page padding varies:
  - `py-8 sm:py-12` (Dashboard)
  - `py-12` (Templates, Analytics, Settings)
  - `py-6 sm:py-10` (Executive, Org Dashboard, Library)
  - `py-4 sm:py-8` (Process page)
- **Metric cards** have 3 different implementations:
  - `QuickStats` in Dashboard — simple white card, bold number, xs description
  - `OrgMetrics` in Org Dashboard — colored bg, animated counter, trend icon
  - `ExecutiveMetrics` in Executive — gradient bg, gauge rings, trend badges
  These should be one component with variants.
- **Empty state designs** are slightly different on every page: different icon sizes, different spacing, different CTA styles.
- **Section header patterns:** Some use `uppercase tracking-wide text-sm`, others use `text-lg font-bold`. No standard.

### Recommendations
1. Standardize button sizes: sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3).
2. Standardize border-radius: small (rounded-lg), medium (rounded-xl), large (rounded-2xl).
3. Create a single MetricCard component with size/color variants.
4. Standardize page padding to `py-6 sm:py-10` everywhere.
5. Create a shared EmptyState component.
6. Establish gradient usage rule: only for primary hero CTAs, flat color for all other buttons.

---

## 4. Error Prevention — Rating: 3/5

### Evidence

**Good:**
- **Delete confirmation dialog** on Dashboard: `confirm('Delete this process map?')` before deletion.
- **Clear All Data** in Settings: proper modal with warning icon, description of consequences, "Consider exporting first" advice, and separate Cancel/Delete buttons.
- **Approval Workflow** requires comment before requesting changes (button disabled without comment, with title tooltip explaining why).
- **Wizard step validation:** Industry selection required before proceeding (step 1). Process description must be 20+ characters (step 2). `canProceed()` gates the Continue button.
- **Form autofocus** on login page password field.

**Problems:**
- **No autosave.** If a user types a long process description in the wizard and accidentally navigates away, everything is lost. No localStorage draft saving.
- **No duplicate detection.** User can create the same process multiple times with no warning.
- **Delete uses `window.confirm()` on Dashboard** — browser-native, not styled, can't be undone. Settings page has a proper modal but Dashboard doesn't.
- **No undo for process deletion.** No soft-delete, no trash, no "Undo" toast.
- **ROI Calculator allows 0 and negative inputs.** Dividing by zero produces broken displays.
- **Template navigation uses URL params.** If the URL gets truncated (e.g., sharing the link), the template pre-fill breaks silently.
- **No form state persistence.** Refreshing during the 4-step wizard loses all input.
- **Approval workflow** allows rapid double-clicks on status change buttons (no debounce).
- **Chat input** allows submitting whitespace-only messages (`.trim()` check exists but only on empty string).
- **No rate limiting feedback for AI endpoints.** If the API returns a rate limit error, the user sees a generic error message.

### Recommendations
1. Implement autosave for wizard drafts (localStorage).
2. Replace `window.confirm()` with styled modal component everywhere.
3. Add undo toast for deletions (soft-delete with 5-second undo window).
4. Add input constraints: `min="1"` on number inputs, debounce on action buttons.
5. Add form state persistence (URL state or localStorage) for the wizard.
6. Show specific error messages for rate limits vs server errors.

---

## 5. Speed / Efficiency — Rating: 3/5

### Evidence

**Good:**
- **Wizard flow** is well-paced: 4 steps, each focused on one task. Can complete in <60 seconds for a simple process.
- **Template shortcut:** 1 click from Templates page to pre-filled wizard. Good for repeat users.
- **Demo mode:** 1 click to see a fully-loaded process — great for onboarding.
- **Keyboard support:** Chat input supports Enter to send, Shift+Enter for newline. Voice input option on wizard.
- **Search on Library and Dashboard** is instant (client-side filtering).
- **Tab switching** on process page is instant (no re-fetch).

**Problems:**
- **AI analysis takes 20-40 seconds.** This is inherent to the AI provider but the progress indicator helps. However, there's no way to cancel or navigate away and come back.
- **No keyboard shortcuts.** Power users can't use Cmd+N for new process, Cmd+K for search, etc.
- **Dashboard and Library duplicate functionality.** Users have to check two places to find their processes.
- **Process detail page requires too many clicks** to see key information:
  - Health Score: visible (0 clicks)
  - Flow Map: visible (0 clicks)
  - ROI Calculator: 1 click (tab switch)
  - Version History: 1 click
  - Audit Trail: 1 click
  - Comparison Table: scroll down (hidden below the fold)
  - Approval Status: scroll down on left panel
  This is acceptable but the left panel is overloaded.
- **Navigation between processes** requires going back to Dashboard/Library first. No "Next Process" or "Previous Process" navigation.
- **No recent/frequent shortcut.** Dashboard has "Recently Viewed" section (good) but the nav doesn't expose it.
- **Mobile bottom nav** takes users to 6 destinations, none of which is "Create New" — the primary action. The "New" button is only in the top bar on mobile, easy to miss when scrolled down.
- **Settings page** is sparse (just data management) but takes a top-level nav slot.
- **Creating a process from Library** requires 2 steps: click "New" → arrive at wizard. Could offer quick-create.

### Recommendations
1. Add keyboard shortcuts (Cmd+K search, Cmd+N new process).
2. Merge Dashboard + Library into one view to eliminate context-switching.
3. Add "Next/Previous Process" navigation on process detail page.
4. Move Comparison Table higher on process page or make it a tab.
5. Replace "Settings" in mobile nav with "New" (primary action).
6. Add floating action button on mobile for "New Process."
7. Consider background AI analysis with push notification when done (for long-running analyses).

---

## Top 10 UX Issues — Ranked by Severity

### P0 — Critical (Blocks core tasks or confuses users)

| # | Issue | Where | Impact | Recommended Fix | Effort |
|---|-------|-------|--------|-----------------|--------|
| 1 | **Navigation overload: 8 top-level items with ambiguous labels** | Global nav (layout.tsx), Mobile nav (MobileNav.tsx) | New users can't figure out where to go. "Dashboard" vs "Org Analytics" vs "Executive" all sound the same. First-time confusion leads to abandonment. | Consolidate to 3 primary nav items (Dashboard, Library, Create) + 3 secondary. Merge Dashboard + Library. Merge Org Analytics into Executive. | **M** |
| 2 | **No feedback on critical user actions (save, copy, status changes)** | Process page, Approval Workflow, Share/Collaborate | Users don't know if their action succeeded. Clicking "Share" changes button text briefly but there's no persistent confirmation. Status changes have no success indicator. | Add toast notifications for all mutations. Add loading spinners to async buttons. | **S** |
| 3 | **No autosave or form persistence in wizard** | `/new` (NewProcessForm) | User types a detailed 500-word process description, accidentally navigates away or browser crashes → all input lost. Major frustration for the core user flow. | Save wizard state to localStorage on every keystroke. Restore on page load. Clear on successful submission. | **S** |

### P1 — High (Significant friction or confusion)

| # | Issue | Where | Impact | Recommended Fix | Effort |
|---|-------|-------|--------|-----------------|--------|
| 4 | **Dashboard and Library show same data in different layouts with no clear distinction** | `/dashboard`, `/library` | User doesn't know which page to use. Both show all processes from the same IndexedDB store. Wastes time navigating between them. | Merge into single `/processes` page with view modes (personal grid, org list, kanban). | **M** |
| 5 | **Process detail page left panel is overloaded (7 sections stacked vertically)** | `/process/[id]` | Key information (Health Score, Smart Suggestions, Approval Workflow) is hidden below the fold. Users miss important features. The secondary tab bar (Map/ROI/History/Audit) appears mid-panel, breaking visual flow. | Reorganize into 2-tab layout: "Analysis" (health + suggestions + map) and "Actions" (approval + audit + history). Or use collapsible sections. | **M** |
| 6 | **Executive and Org Analytics are separate pages with overlapping content** | `/executive`, `/org-dashboard` | Both show org health, department breakdowns, and action items. Executive adds compliance donut and cost estimate. Org Dashboard adds risk matrix and cost calculator. Splitting forces users to check two places for complete picture. | Merge into single `/insights` page with sections. Risk Matrix, Cost Calculator, Compliance Summary, Department Performance, Action Items — all in one view. | **M** |
| 7 | **Mobile bottom nav has 6 items, missing the primary action (Create)** | MobileNav.tsx | Mobile users can't quickly create a new process from the bottom nav — the primary CTA. They must scroll to top to find the small "New" button. 6 items also exceeds the 4-5 recommendation for bottom nav usability. | Reduce to 4 items: Home, Processes, Create (+), Settings. Make Create the center prominent item. | **S** |

### P2 — Medium (Polish and optimization)

| # | Issue | Where | Impact | Recommended Fix | Effort |
|---|-------|-------|--------|-----------------|--------|
| 8 | **Inconsistent button sizing, border-radius, and spacing across pages** | Global (all pages and components) | App feels "assembled" rather than "designed." Professional users in wealth management expect polish. Erodes trust. | Create standardized design tokens and component variants (see V2_DESIGN_TOKENS.md and V2_COMPONENT_SPECS.md). | **L** |
| 9 | **3 different metric card implementations** | Dashboard (QuickStats), Org Dashboard (OrgMetrics), Executive (ExecutiveMetrics) | Code duplication, visual inconsistency between pages. The same concept (metric display) looks different depending on which page you're on. | Create single `<MetricCard>` component with `variant` prop (simple, colored, gauge). Use across all pages. | **M** |
| 10 | **No keyboard shortcuts or command palette for power users** | Global | Wealth management professionals handle many processes. No way to quickly search, create, or navigate without mouse. Reduces efficiency for repeat users. | Add Cmd+K command palette (search + actions). Add Cmd+N for new process. | **M** |

---

## Summary Scorecard

| Heuristic | Score | Grade |
|-----------|-------|-------|
| Clarity | 3/5 | C+ |
| Feedback | 2/5 | D+ |
| Consistency | 3/5 | C+ |
| Error Prevention | 3/5 | C+ |
| Speed / Efficiency | 3/5 | C+ |
| **Overall** | **2.8/5** | **C** |

The app has strong **core functionality** — the AI analysis, flow maps, and process management are well-built. The primary gaps are in **information architecture** (too many overlapping pages), **user feedback** (silent mutations), and **design consistency** (no standardized component system). V2 should prioritize IA simplification and a proper design system before adding new features.
