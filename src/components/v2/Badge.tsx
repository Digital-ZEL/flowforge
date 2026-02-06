'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--v2-bg-muted)] text-[var(--v2-text-secondary)] border-[var(--v2-border-subtle)]',
  success:
    'bg-[var(--v2-success-subtle)] text-[var(--v2-success-text)] border-transparent',
  warning:
    'bg-[var(--v2-warning-subtle)] text-[var(--v2-warning-text)] border-transparent',
  error:
    'bg-[var(--v2-error-subtle)] text-[var(--v2-error-text)] border-transparent',
  info:
    'bg-[var(--v2-info-subtle)] text-[var(--v2-info-text)] border-transparent',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--v2-text-muted)]',
  success: 'bg-[var(--v2-success)]',
  warning: 'bg-[var(--v2-warning)]',
  error: 'bg-[var(--v2-error)]',
  info: 'bg-[var(--v2-info)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0 h-5 gap-1',
  md: 'text-[var(--v2-text-xs)] px-2 py-0.5 h-6 gap-1.5',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) => (
  <span
    className={[
      'inline-flex items-center font-medium border rounded-[var(--v2-radius-full)]',
      'transition-colors duration-[var(--v2-duration-fast)]',
      'whitespace-nowrap select-none',
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {dot && (
      <span
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
        aria-hidden="true"
      />
    )}
    {children}
  </span>
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
