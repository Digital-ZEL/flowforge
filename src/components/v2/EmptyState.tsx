'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  children,
  ...props
}) => (
  <div
    className={[
      'flex flex-col items-center justify-center text-center',
      'py-[var(--v2-space-16)] px-[var(--v2-space-8)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {icon && (
      <div
        className="w-12 h-12 rounded-[var(--v2-radius-lg)] bg-[var(--v2-bg-muted)] border border-[var(--v2-border-subtle)] flex items-center justify-center text-[var(--v2-text-muted)] mb-[var(--v2-space-6)] [&>svg]:w-6 [&>svg]:h-6"
        aria-hidden="true"
      >
        {icon}
      </div>
    )}
    <h3 className="text-[var(--v2-text-md)] font-semibold text-[var(--v2-text)] tracking-[var(--v2-tracking-tight)]">
      {title}
    </h3>
    {description && (
      <p className="mt-[var(--v2-space-2)] text-[var(--v2-text-sm)] text-[var(--v2-text-secondary)] max-w-sm">
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <div className="mt-[var(--v2-space-6)]">
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
    {children}
  </div>
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
export type { EmptyStateProps };
