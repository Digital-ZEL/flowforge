# FlowForge V2 — Design Tokens

**Date:** February 6, 2026  
**Direction:** Clean, minimal, premium. Linear/Vercel aesthetic.  
**Format:** CSS custom properties, ready for Tailwind config and direct import.

---

## Design Philosophy

V1 uses indigo/purple as the brand color, which reads "enterprise SaaS" but leans heavy. V2 shifts to a more restrained palette:

- **Less purple, more slate.** The UI is mostly neutral. Color is earned — used for status, actions, and emphasis.
- **Tighter contrast.** Background and surface colors are closer together in value, creating a layered feel rather than stark borders.
- **Sharper type hierarchy.** Fewer font sizes, bigger jumps between levels. Every heading level is instantly distinguishable.
- **Subtle depth.** Shadows are barely visible. Borders are light. Elevation is communicated through subtle background shifts, not heavy shadows.

---

## Color Palette

### Primary (Brand)

Moving from pure indigo to a slightly warmer blue-indigo. Less "generic SaaS," more distinctive.

```css
:root {
  --color-primary-50:  #f0f4ff;
  --color-primary-100: #e0e8ff;
  --color-primary-200: #c7d4fe;
  --color-primary-300: #a3b5fd;
  --color-primary-400: #7b91fa;
  --color-primary-500: #5a6ef5;  /* Primary brand — buttons, links, active states */
  --color-primary-600: #4455ea;
  --color-primary-700: #3843d6;
  --color-primary-800: #2e38ae;
  --color-primary-900: #2b3489;
  --color-primary-950: #1a1f54;
}
```

### Neutral (Gray Scale)

Cool-toned slate. Slightly blue undertone for sophistication.

```css
:root {
  --color-neutral-0:   #ffffff;
  --color-neutral-25:  #fcfcfd;
  --color-neutral-50:  #f8f9fb;
  --color-neutral-100: #f1f3f6;
  --color-neutral-200: #e4e7ec;
  --color-neutral-300: #cdd2db;
  --color-neutral-400: #9ba3b3;
  --color-neutral-500: #6b7589;
  --color-neutral-600: #4e576b;
  --color-neutral-700: #3b4257;
  --color-neutral-800: #282e3e;
  --color-neutral-900: #1a1f2e;
  --color-neutral-950: #12141e;

  /* Semantic aliases */
  --color-bg-primary:    var(--color-neutral-0);
  --color-bg-secondary:  var(--color-neutral-50);
  --color-bg-tertiary:   var(--color-neutral-100);
  --color-surface:       var(--color-neutral-0);
  --color-surface-hover: var(--color-neutral-50);
  --color-border:        var(--color-neutral-200);
  --color-border-subtle: var(--color-neutral-100);
  --color-text-primary:  var(--color-neutral-900);
  --color-text-secondary:var(--color-neutral-500);
  --color-text-tertiary: var(--color-neutral-400);
  --color-text-disabled: var(--color-neutral-300);
}

/* Dark mode */
.dark {
  --color-bg-primary:    var(--color-neutral-950);
  --color-bg-secondary:  var(--color-neutral-900);
  --color-bg-tertiary:   var(--color-neutral-800);
  --color-surface:       var(--color-neutral-900);
  --color-surface-hover: var(--color-neutral-800);
  --color-border:        var(--color-neutral-800);
  --color-border-subtle: var(--color-neutral-800);
  --color-text-primary:  var(--color-neutral-50);
  --color-text-secondary:var(--color-neutral-400);
  --color-text-tertiary: var(--color-neutral-500);
  --color-text-disabled: var(--color-neutral-700);
}
```

### Semantic Colors

```css
:root {
  /* Success */
  --color-success-50:  #ecfdf5;
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  --color-success-700: #047857;
  --color-success-bg:  var(--color-success-50);
  --color-success-text:var(--color-success-700);

  /* Warning */
  --color-warning-50:  #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  --color-warning-bg:  var(--color-warning-50);
  --color-warning-text:var(--color-warning-700);

  /* Error / Danger */
  --color-error-50:  #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  --color-error-bg:  var(--color-error-50);
  --color-error-text:var(--color-error-700);

  /* Info */
  --color-info-50:  #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
  --color-info-bg:  var(--color-info-50);
  --color-info-text:var(--color-info-700);
}

.dark {
  --color-success-bg:  #052e16;
  --color-success-text:#34d399;
  --color-warning-bg:  #422006;
  --color-warning-text:#fbbf24;
  --color-error-bg:    #450a0a;
  --color-error-text:  #fca5a5;
  --color-info-bg:     #172554;
  --color-info-text:   #93c5fd;
}
```

### Health Score Colors

```css
:root {
  --health-healthy:       #10b981;  /* 80-100 */
  --health-attention:     #f59e0b;  /* 60-79  */
  --health-at-risk:       #f97316;  /* 40-59  */
  --health-critical:      #ef4444;  /* 0-39   */
}
```

---

## Typography

### Font Stack

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
```

### Size Scale (with responsive clamp)

```css
:root {
  --text-xs:    clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem);    /* 11-12px */
  --text-sm:    clamp(0.8125rem, 0.78rem + 0.1vw, 0.875rem);   /* 13-14px */
  --text-base:  clamp(0.875rem, 0.85rem + 0.1vw, 1rem);        /* 14-16px */
  --text-lg:    clamp(1rem, 0.95rem + 0.15vw, 1.125rem);       /* 16-18px */
  --text-xl:    clamp(1.125rem, 1.05rem + 0.25vw, 1.25rem);    /* 18-20px */
  --text-2xl:   clamp(1.375rem, 1.2rem + 0.5vw, 1.5rem);       /* 22-24px */
  --text-3xl:   clamp(1.625rem, 1.4rem + 0.75vw, 1.875rem);    /* 26-30px */
  --text-4xl:   clamp(2rem, 1.7rem + 1vw, 2.25rem);             /* 32-36px */
  --text-5xl:   clamp(2.5rem, 2rem + 1.5vw, 3rem);              /* 40-48px */
}
```

### Weight Scale

```css
:root {
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
}
```

### Line Height

```css
:root {
  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
}
```

### Typography Presets

```css
/* Page Title:   text-3xl font-bold leading-tight tracking-tight */
/* Section Head: text-lg font-semibold leading-snug */
/* Card Title:   text-sm font-semibold leading-tight */
/* Body:         text-sm font-normal leading-relaxed */
/* Caption:      text-xs font-medium leading-normal text-secondary */
/* Overline:     text-xs font-semibold uppercase tracking-widest text-tertiary */
```

---

## Spacing

Base unit: **4px**

```css
:root {
  --space-0:    0;
  --space-0.5:  0.125rem;  /*  2px */
  --space-1:    0.25rem;   /*  4px */
  --space-1.5:  0.375rem;  /*  6px */
  --space-2:    0.5rem;    /*  8px */
  --space-2.5:  0.625rem;  /* 10px */
  --space-3:    0.75rem;   /* 12px */
  --space-4:    1rem;      /* 16px */
  --space-5:    1.25rem;   /* 20px */
  --space-6:    1.5rem;    /* 24px */
  --space-8:    2rem;      /* 32px */
  --space-10:   2.5rem;    /* 40px */
  --space-12:   3rem;      /* 48px */
  --space-16:   4rem;      /* 64px */
  --space-20:   5rem;      /* 80px */
  --space-24:   6rem;      /* 96px */

  /* Semantic spacing */
  --space-page-x:  var(--space-6);  /* Page horizontal padding */
  --space-page-y:  var(--space-10); /* Page vertical padding */
  --space-section: var(--space-10); /* Between sections */
  --space-card:    var(--space-5);  /* Card internal padding */
  --space-inline:  var(--space-2);  /* Between inline elements */
  --space-stack:   var(--space-4);  /* Between stacked elements */
}

@media (min-width: 640px) {
  :root {
    --space-page-x:  var(--space-8);
    --space-page-y:  var(--space-12);
  }
}

@media (min-width: 1024px) {
  :root {
    --space-page-x:  var(--space-8);
  }
}
```

---

## Border Radii

```css
:root {
  --radius-sm:   0.375rem;  /*  6px — badges, tags, small elements */
  --radius-md:   0.5rem;    /*  8px — buttons, inputs */
  --radius-lg:   0.75rem;   /* 12px — cards, panels */
  --radius-xl:   1rem;      /* 16px — modals, large cards */
  --radius-2xl:  1.25rem;   /* 20px — hero sections, full cards */
  --radius-full: 9999px;    /* Pills, avatars, round buttons */
}
```

### Usage Rules
| Element | Radius |
|---------|--------|
| Badge, Tag, Pill | `--radius-full` |
| Button, Input, Select | `--radius-md` |
| Card, Panel | `--radius-lg` |
| Modal, Dialog | `--radius-xl` |
| Toast, Notification | `--radius-lg` |
| Avatar, Status dot | `--radius-full` |
| Nav bar | None (flush) |

---

## Shadows

Subtle, layered shadows. Less dramatic than V1.

```css
:root {
  --shadow-xs:     0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:     0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:     0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
  --shadow-lg:     0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
  --shadow-xl:     0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04);

  /* Colored shadows for CTAs */
  --shadow-primary: 0 4px 14px rgba(90, 110, 245, 0.2);

  /* Focus ring */
  --shadow-focus:  0 0 0 2px var(--color-bg-primary), 0 0 0 4px var(--color-primary-500);
}

.dark {
  --shadow-xs:     0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-sm:     0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md:     0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
  --shadow-lg:     0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
  --shadow-xl:     0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  --shadow-primary: 0 4px 14px rgba(90, 110, 245, 0.3);
}
```

### Usage Rules
| Element | Shadow |
|---------|--------|
| Card (resting) | `--shadow-xs` or none |
| Card (hover) | `--shadow-sm` |
| Dropdown, Popover | `--shadow-md` |
| Modal, Dialog | `--shadow-xl` |
| Toast | `--shadow-lg` |
| Primary CTA (hover) | `--shadow-primary` |
| Nav bar (sticky) | `--shadow-xs` |

---

## Transitions

```css
:root {
  /* Durations */
  --duration-fast:    100ms;  /* Hover states, micro-interactions */
  --duration-normal:  200ms;  /* Standard transitions */
  --duration-slow:    300ms;  /* Panel open/close, content reveals */
  --duration-slower:  500ms;  /* Page transitions, charts animating in */
  --duration-slowest: 1000ms; /* Health gauge filling, score animations */

  /* Easing */
  --ease-default:  cubic-bezier(0.4, 0, 0.2, 1);    /* General purpose */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);        /* Entering (accelerate) */
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);        /* Exiting (decelerate) */
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);      /* Symmetric */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful bounce */

  /* Composites */
  --transition-colors: color var(--duration-fast) var(--ease-default),
                       background-color var(--duration-fast) var(--ease-default),
                       border-color var(--duration-fast) var(--ease-default);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
  --transition-transform: transform var(--duration-normal) var(--ease-default);
  --transition-opacity: opacity var(--duration-normal) var(--ease-default);
  --transition-all: all var(--duration-normal) var(--ease-default);
}
```

### Animation Guidelines
| Trigger | Duration | Easing | Example |
|---------|----------|--------|---------|
| Hover | Fast (100ms) | Default | Button color change, card highlight |
| Click feedback | Fast (100ms) | Spring | Button scale(0.97), press effect |
| Panel open | Slow (300ms) | Out | Slide-in from right, fade-in |
| Panel close | Normal (200ms) | In | Quick dismiss |
| Toast enter | Slow (300ms) | Spring | Slide up + fade in |
| Toast exit | Normal (200ms) | In | Fade out + slide down |
| Chart/gauge fill | Slowest (1s) | Out | Health score ring animation |
| Skeleton shimmer | 1.5s loop | In-Out | Loading placeholder |

---

## Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a3b5fd',
          400: '#7b91fa',
          500: '#5a6ef5',
          600: '#4455ea',
          700: '#3843d6',
          800: '#2e38ae',
          900: '#2b3489',
          950: '#1a1f54',
        },
      },
      borderRadius: {
        sm:  '0.375rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        xs:      '0 1px 2px rgba(0,0,0,0.04)',
        sm:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:      '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        lg:      '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.04)',
        xl:      '0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)',
        primary: '0 4px 14px rgba(90,110,245,0.2)',
      },
      transitionDuration: {
        fast:    '100ms',
        normal:  '200ms',
        slow:    '300ms',
        slower:  '500ms',
        slowest: '1000ms',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
};
```

---

## Z-Index Scale

```css
:root {
  --z-base:      0;
  --z-raised:    10;    /* Cards with elevation */
  --z-dropdown:  20;    /* Dropdowns, popovers */
  --z-sticky:    30;    /* Sticky headers */
  --z-overlay:   40;    /* Overlay backgrounds */
  --z-modal:     50;    /* Modals, dialogs */
  --z-toast:     60;    /* Toast notifications */
  --z-tooltip:   70;    /* Tooltips */
  --z-command:   80;    /* Command palette */
}
```
