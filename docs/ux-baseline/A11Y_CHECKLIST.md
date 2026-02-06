# Accessibility Checklist — FlowForge

> Audited: 2026-02-06 against current codebase  
> Standard: WCAG 2.1 Level AA  
> Status key: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

## 1. Images

### ✅ PASS — All images have alt text

**Evidence:** `grep -rn '<img' src/ | grep -v 'alt='` returned **zero results**. No `<img>` tags are used without `alt` attributes. The app primarily uses inline SVG icons (with `aria-hidden="true"` in V2 components) rather than `<img>` tags.

**Note:** SVG icons in V2 `Button` component correctly use `aria-hidden="true"` on decorative icon wrappers.

---

## 2. Form Inputs

### ⚠️ PARTIAL — Form inputs have labels

**Findings:**

| Component | Issue | Severity |
|---|---|---|
| `ROICalculator.tsx` (L105, L116, L127) | `<label>` present but missing `htmlFor` — not programmatically associated with `<input>` | Medium |
| `ExportButton.tsx` (L248-251) | `<label>` present but missing `htmlFor` on PDF modal input | Medium |
| `CostCalculator.tsx` (L125-132) | `<label>` present but missing `htmlFor` on range input | Medium |
| `ApprovalWorkflow.tsx` (L160) | `<textarea>` has no `<label>` or `aria-label` (only placeholder) | High |
| `ProcessChat.tsx` (L336) | `<textarea>` has no `<label>` (has placeholder + `aria-label` on send button, but input itself unlabeled) | High |
| `dashboard/page.tsx` (L196) | Search `<input>` has `aria-label` ✅ | — |
| `library/page.tsx` (L174-180) | Search `<input>` has `aria-label` ✅ | — |
| `library/page.tsx` (L228) | Sort `<select>` has `htmlFor` ✅ | — |
| `login/page.tsx` (L61-64) | Password `<input>` has `htmlFor` ✅ | — |
| `collaborate/[id]/page.tsx` (L142, L149) | Name + comment inputs have no `<label>` or `aria-label` (placeholder only) | High |
| `new/page.tsx` (L396, L443) | Process description textareas have no `<label>` association | Medium |
| `settings/page.tsx` (L176) | Toggle switch input — no label association | Low |

**V2 Input component:** ✅ Properly implements `htmlFor`/`id` association, `aria-describedby`, and `aria-invalid`.

**Remediation:** Add `aria-label` to all inputs that lack a visible `<label>` with `htmlFor`, or add `id` to inputs and `htmlFor` to existing labels.

---

## 3. Color Contrast

### ⚠️ PARTIAL — Color contrast meets WCAG AA

**Evidence:**
- `globals.css` includes a dark-mode override: `.dark .text-slate-400 { color: #94a3b8; }` — explicitly notes this meets 4.5:1 on `slate-950`. ✅
- Primary text uses `text-slate-900` (light) / `text-white` (dark) — high contrast ✅
- Secondary text uses `text-slate-600` / `text-slate-400` — the CSS override helps, but needs verification for all combinations
- `placeholder-slate-400` on inputs — placeholders are not required to meet AA contrast, but visually they appear faint ⚠️
- Brand colors (`brand-600`, `brand-400`) used in links — need to verify 4.5:1 ratio against white/dark backgrounds

**Remediation:** Run automated contrast check (axe-core or Lighthouse) on all pages, especially:
- `text-slate-500` on light backgrounds
- `text-brand-400` on dark backgrounds
- Chart/graph labels in analytics pages

---

## 4. Keyboard Navigation

### ⚠️ PARTIAL — All interactive elements keyboard accessible

**Evidence:**
- **No `onClick` on non-interactive elements:** `grep -rn 'onClick' src/ | grep '<div\|<span'` returned **zero results** ✅
- **V2 Card:** Clickable cards properly add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler for Enter/Space ✅
- **All interactive elements use `<button>` or `<a>`** ✅
- **React Flow canvas:** Not keyboard navigable by default — users cannot tab through process nodes ⚠️
- **Mobile bottom nav links** need `tabIndex` verification

**Remediation:**
- Add keyboard navigation hints for React Flow (or accept as limitation with documented workaround)
- Ensure mobile nav items are in tab order on desktop as well

---

## 5. Focus Indicators

### ✅ PASS — Focus indicators visible

**Evidence:**
- `globals.css` L15-18: Global `*:focus-visible` rule applies `2px solid #6366f1` (indigo) outline with `2px` offset ✅
- V2 Button: Has explicit `focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]` ✅
- All form inputs use `focus:ring-2 focus:ring-brand-500` ✅
- Focus indicators use `focus-visible` (not `focus`), correctly avoiding mouse-click outlines ✅

---

## 6. Modal Focus Trap

### ❌ FAIL — Modal focus trap NOT implemented

**Evidence:**
- **PDF Export Modal** (`ExportButton.tsx` L240): Uses `fixed inset-0 z-50` overlay but has **no focus trap**. Tab key can escape the modal to background content.
- **Clear Confirmation Modal** (`settings/page.tsx` L213): Same issue — no focus trap implementation.
- Neither modal uses `role="dialog"`, `aria-modal="true"`, or `aria-labelledby`.
- No `useEffect` to trap focus or return focus on close.
- No Escape key handler to close modals.

**Remediation (High Priority):**
```tsx
// Create a reusable Modal component with:
// 1. role="dialog" + aria-modal="true" + aria-labelledby
// 2. Focus trap (trap-focus on mount, restore on unmount)
// 3. Escape key closes modal
// 4. Click-outside closes modal
// 5. Prevent background scroll
```

---

## 7. Skip Navigation

### ❌ FAIL — Skip navigation link NOT present

**Evidence:** `grep -rn 'skip.*nav\|skipnav\|skip-to\|Skip to' src/` returned **zero results**. The `layout.tsx` has a `<nav>` and `<main>`, but no skip link to jump past navigation.

**Remediation:**
```tsx
// In layout.tsx, before <nav>:
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-brand-600">
  Skip to main content
</a>
// Add id="main-content" to <main>
```

---

## 8. Semantic HTML

### ⚠️ PARTIAL — Headings hierarchy and landmarks

**Landmarks:**
- `<nav>` — Present in `layout.tsx` (desktop + mobile) ✅
- `<main>` — Present in `layout.tsx` ✅
- `<footer>` — Present in `page.tsx` (landing) ✅
- `<section>` — Used in landing page and executive dashboard ✅
- `<header>` — **Missing** from layout ⚠️
- `<aside>` — Not used (but not structurally required) ✅

**Headings:**
- Most pages start with `<h1>` ✅
- Components use `<h3>` and `<h4>` for sub-sections ✅
- **Heading level skips:** Some components use `<h3>` directly under a page `<h1>` without an `<h2>`. For example, `ROICalculator` uses `<h3>` → `<h4>`, but the parent page may jump from `<h1>` to `<h3>`. ⚠️

**Remediation:**
- Wrap the nav bar in `<header>` landmark
- Audit heading hierarchy per page to ensure no level skips (h1 → h2 → h3)

---

## 9. ARIA Labels on Icon-Only Buttons

### ⚠️ PARTIAL — Icon-only buttons have ARIA labels

**Good examples (have `aria-label`):**
- Toast dismiss button (`Toast.tsx` L79) ✅
- Chat open/close buttons (`ProcessChat.tsx` L224, L255) ✅
- Delete process button (`dashboard/page.tsx` L112) ✅
- Share/collab buttons (`process/[id]/page.tsx` L186, L196) ✅
- Grid/list view toggles (`library/page.tsx` L136, L149) ✅
- Back button (`new/page.tsx` L523) ✅

**Missing `aria-label` (icon-only or unclear text):**

| Component | Line | Description |
|---|---|---|
| `AnalysisPanel.tsx` | L45 | Toggle button (expand/collapse) — icon only, no label |
| `AnalysisPanel.tsx` | L56 | Re-analyze button — has text, but icon-prefixed |
| `VersionHistory.tsx` | L105 | Restore button — has text ✅ |
| `MobileNav.tsx` | All nav items | Have visible text labels ✅ |

**Remediation:** Add `aria-label` to the AnalysisPanel toggle button.

---

## 10. Reduced Motion Support

### ❌ FAIL — No `prefers-reduced-motion` support

**Evidence:** `grep -rn 'prefers-reduced-motion' src/` returned **zero results**.

The codebase uses several animations:
- `shimmer` loading animation (`globals.css`)
- `slide-up` toast animation
- `pulse-ring` step indicator
- `fade-in-up` landing page animation
- `score-fill` health gauge animation
- `v2-spin` spinner in V2 Button
- Various Tailwind `transition-*` and `animate-*` classes

**Remediation (High Priority):**
```css
/* Add to globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 11. Screen Reader Testing

### ⚠️ NOT TESTED — Key flows need manual testing

**Recommended test flows:**
1. Create new process (navigate `/new`, fill form, submit)
2. View process detail (`/process/[id]`, switch views, use chat)
3. Export process (open export menu, select format)
4. Search + filter library (`/library`)
5. Approval workflow (submit, approve/reject)

**Test tools:** NVDA (Windows), VoiceOver (macOS), TalkBack (Android)

---

## Summary

| # | Check | Status | Priority |
|---|---|---|---|
| 1 | Images have alt text | ✅ PASS | — |
| 2 | Form inputs have labels | ⚠️ PARTIAL | High |
| 3 | Color contrast WCAG AA | ⚠️ PARTIAL | Medium |
| 4 | Keyboard accessible | ⚠️ PARTIAL | Medium |
| 5 | Focus indicators visible | ✅ PASS | — |
| 6 | Modal focus trap | ❌ FAIL | **Critical** |
| 7 | Skip navigation link | ❌ FAIL | **High** |
| 8 | Semantic HTML | ⚠️ PARTIAL | Medium |
| 9 | ARIA labels on icon buttons | ⚠️ PARTIAL | Low |
| 10 | Reduced motion support | ❌ FAIL | **High** |
| 11 | Screen reader tested | ⚠️ NOT TESTED | High |

### Critical Fixes Before V2 Launch

1. **Add modal focus trap** — Create reusable `<Modal>` component
2. **Add skip navigation link** — 5 min fix in `layout.tsx`
3. **Add `prefers-reduced-motion`** — CSS-only fix in `globals.css`
4. **Add missing `aria-label`/`htmlFor`** on form inputs
5. **Run Lighthouse a11y audit** on all routes, target score ≥ 90
