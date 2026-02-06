# FlowForge V2 — UX Design Principles

**Date:** February 6, 2026  
**Purpose:** These 7 principles guide every design decision in V2. When in doubt, refer here.  
**Inspiration:** Linear, Vercel Dashboard, Notion, Raycast — modern SaaS that respects user intelligence.

---

## 1. Progressive Disclosure

> Show only what's needed, when it's needed. Never overwhelm.

**Description:** Every screen should have a clear primary focus. Secondary information is available but doesn't compete for attention. Use expandable sections, tabs, and drill-downs — not everything-at-once dashboards.

**How it applies:**
- Process detail page shows Health Score + Map on first load. ROI, History, and Audit are one click away as tabs — not stacked vertically.
- Insights page loads hero metrics first, with collapsible sections below. Users choose their depth.
- The navigation shows 3 items, not 8. Less frequent destinations are grouped or icon-only.
- Smart Suggestions are collapsed by default on process pages; a badge count hints at available quick wins.

**Anti-pattern to avoid:** V1's process detail page where Health Score, Bottlenecks, Smart Suggestions, Tab Switcher, Approval Workflow, and Version History all fight for attention in a single scrollable column.

---

## 2. Immediate Feedback

> Every action gets a visible response. Never leave the user guessing.

**Description:** Users should always know: (a) did my action work? (b) is something loading? (c) what just changed? This applies to clicks, form submissions, navigation, and background processes. The response must match the weight of the action — a toast for saving, a modal for deleting.

**How it applies:**
- **Save/Update:** Toast notification: "Process saved" ✓
- **Copy to clipboard:** Toast notification: "Link copied" ✓
- **Status change:** Toast + animated status badge transition
- **AI analysis:** Progress bar with estimated time remaining + step indicators (already well-done in V1)
- **Delete:** Undo toast with 5-second countdown: "Process moved to archive. [Undo]"
- **Export:** Progress indicator → success toast with download confirmation
- **Form validation:** Inline error messages appear below fields in real-time, not just disabled buttons
- **Background operations:** Subtle loading spinners on buttons during async operations

**Anti-pattern to avoid:** V1's silent clipboard copy (button text briefly changes), silent save operations, and disabled buttons with no explanation.

---

## 3. Minimal Navigation, Maximum Context

> Users should always know where they are and how to get back. But don't make them think about navigation.

**Description:** Navigation should be so intuitive it's invisible. Breadcrumbs provide context. The primary action (Create) is always accessible. Search is universal. Going "back" never requires browser navigation.

**How it applies:**
- **Breadcrumbs** on every detail page: `Processes > Client Onboarding > ROI Calculator`
- **Cmd+K command palette** for universal search and quick navigation — find any process, jump to any page, trigger any action.
- **+ Create** button is persistent in the nav bar and as a mobile FAB. Never more than 1 click away.
- **Context-aware back navigation:** Process detail page has a `← Processes` link, not a generic back button.
- **3 primary nav items** — each maps to a clear mental model (your work, your org's health, make something new).

**Anti-pattern to avoid:** V1's 8 nav items that require users to learn the taxonomy before they can use the app.

---

## 4. Calm Density

> Dense information is fine — chaos is not. Use whitespace and hierarchy to make density comfortable.

**Description:** FlowForge serves professionals who work with data all day. They don't need Fisher-Price UIs with one card per screen. But they do need clear visual hierarchy: primary content stands out, secondary content recedes, and whitespace creates breathing room between sections.

**How it applies:**
- **Process cards** in Library: dense but scannable — health gauge, title, department badge, status, owner, updated date all visible at a glance without expanding.
- **Insights dashboard** uses a consistent card grid with generous padding between sections but dense data within each card.
- **Tables** (Comparison, Audit) use compact rows with hover highlights — not oversized cells.
- **Typography scale** has clear jumps: page title (2xl bold), section title (lg semibold), body (sm), metadata (xs). Each level is immediately distinguishable.
- **Color is structural, not decorative:** Brand color for interactive elements, semantic colors for status (green/yellow/orange/red), neutral for everything else.

**Anti-pattern to avoid:** Enterprise bloat where every metric gets its own full-width card with 100px of padding and a background illustration.

---

## 5. Keyboard-First, Touch-Ready

> Design for keyboard users first, then ensure everything works perfectly by touch.

**Description:** Power users navigate with keyboard shortcuts. Everyone else uses mouse or touch. Both must work flawlessly. Interactive elements must be focusable, have visible focus states, and maintain logical tab order. Touch targets must be ≥44px.

**How it applies:**
- **Cmd+K:** Open command palette (search + actions)
- **Cmd+N:** Create new process
- **Escape:** Close modals, panels, command palette
- **Arrow keys:** Navigate within lists, cards, tabs
- **Enter:** Confirm selection, submit forms
- **Focus rings:** Visible 2px brand-color outline on all interactive elements
- **Touch targets:** All buttons, links, and interactive elements are minimum 44×44px on mobile
- **No hover-only interactions:** Everything accessible by hover must also be accessible by focus/click

**Anti-pattern to avoid:** V1's delete button that only appears on card hover (`opacity-0 group-hover:opacity-100`) — invisible to keyboard users and touch users.

---

## 6. Forgiving by Default

> Make it hard to make mistakes. Make it easy to recover from them.

**Description:** Users will click the wrong thing, type in the wrong field, and navigate away at the worst time. The UI should prevent errors where possible and offer graceful recovery everywhere else. Destructive actions always require confirmation. Data is never truly lost until the user explicitly empties the trash.

**How it applies:**
- **Autosave** wizard drafts to localStorage. If the browser crashes mid-description, the user resumes where they left off.
- **Soft-delete** processes to an Archive tab. "Delete" moves to archive; "Empty Archive" truly deletes.
- **Undo toasts** for all destructive actions: "Process archived. [Undo]" with 5-second countdown.
- **Confirmation modals** for high-impact actions (clear all data, permanent delete, status reversion).
- **Form validation** prevents invalid submissions with inline guidance, not just disabled buttons.
- **Version history** on every process — any change can be reverted.
- **Input constraints:** Number fields have min/max, text fields have character limits, select fields have defaults.

**Anti-pattern to avoid:** V1's `window.confirm('Delete this process map?')` followed by immediate permanent deletion with no undo.

---

## 7. Earn Trust Through Craft

> Every pixel communicates professionalism. Polish isn't extra — it's the product.

**Description:** FlowForge targets wealth management professionals who manage billions in assets. The UI must communicate the same level of care they expect from their tools. This means: smooth animations, pixel-perfect alignment, consistent spacing, thoughtful empty states, appropriate loading states, and zero visual bugs. The design language should feel premium, minimal, and confident — not flashy or busy.

**How it applies:**
- **Transitions:** All state changes animate smoothly (150-300ms). No element should "pop" into existence — it should ease in.
- **Loading states:** Every async operation shows a skeleton or spinner that matches the layout of the loaded content.
- **Empty states:** Every list/grid has a thoughtful empty state with illustration, message, and primary action CTA.
- **Error states:** Errors have context (what happened), guidance (what to do), and action (retry button).
- **Micro-interactions:** Button press scales slightly (scale-95). Cards lift on hover (shadow-md). Toggles slide smoothly. Health score gauges animate on mount.
- **Typography:** Sharp hierarchy with Inter/system font. No decorative fonts. Weight and size do all the work.
- **Color restraint:** Primary brand color used sparingly for CTAs and active states. Most of the UI is neutral grays with semantic color accents.
- **Whitespace:** Generous but purposeful. Sections breathe. Content doesn't touch edges.

**Anti-pattern to avoid:** V1's gradient-heavy landing page CTAs leaking into the app UI (gradients should stay on marketing pages, not in the product).

---

## Quick Reference Card

| Principle | One-Liner | Key Metric |
|-----------|-----------|------------|
| Progressive Disclosure | Show less, reveal on demand | Max 3 primary actions visible per screen |
| Immediate Feedback | Every action gets a response | 0 silent mutations |
| Minimal Navigation | Know where you are, get back easily | 3 nav items + Cmd+K |
| Calm Density | Dense but not chaotic | Clear 4-level type hierarchy |
| Keyboard-First | Shortcuts for power users, touch for everyone | 100% keyboard-navigable |
| Forgiving by Default | Hard to break, easy to recover | All deletes are undoable |
| Earn Trust Through Craft | Every pixel matters | 0 visual inconsistencies |
