'use client';

import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Make the entire card clickable with hover effects */
  clickable?: boolean;
  /** Remove padding for custom layouts */
  noPadding?: boolean;
  /** Subtle glass morphism effect */
  glass?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ clickable = false, noPadding = false, glass = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-[var(--v2-radius-lg)] border border-[var(--v2-border-subtle)]',
          'transition-all duration-[var(--v2-duration-slow)] ease-[var(--v2-ease-default)]',
          glass
            ? 'bg-[var(--v2-glass-bg)] backdrop-blur-[var(--v2-glass-blur)] border-[var(--v2-glass-border)]'
            : 'bg-[var(--v2-bg-subtle)]',
          clickable
            ? 'cursor-pointer hover:border-[var(--v2-border)] hover:shadow-[var(--v2-shadow-md)] hover:-translate-y-0.5 active:translate-y-0'
            : '',
          noPadding ? '' : 'p-[var(--v2-space-6)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (e.target as HTMLDivElement).click();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}) => (
  <div
    className={[
      'flex items-start justify-between gap-[var(--v2-space-4)]',
      'pb-[var(--v2-space-4)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    <div className="min-w-0 flex-1">
      {title && (
        <h3
          className="text-[var(--v2-text-base)] font-semibold text-[var(--v2-text)] leading-[var(--v2-leading-tight)] tracking-[var(--v2-tracking-tight)]"
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-[var(--v2-space-1)] text-[var(--v2-text-sm)] text-[var(--v2-text-secondary)]">
          {description}
        </p>
      )}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

CardHeader.displayName = 'CardHeader';

const CardFooter: React.FC<CardFooterProps> = ({ className = '', children, ...props }) => (
  <div
    className={[
      'pt-[var(--v2-space-4)] mt-[var(--v2-space-4)]',
      'border-t border-[var(--v2-border-subtle)]',
      'flex items-center gap-[var(--v2-space-3)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </div>
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter };
export type { CardProps, CardHeaderProps, CardFooterProps };
