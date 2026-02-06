'use client';

import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--v2-accent)] text-white hover:bg-[var(--v2-accent-hover)] active:bg-[var(--v2-accent-active)] shadow-[var(--v2-shadow-sm)] hover:shadow-[var(--v2-shadow-md)]',
  secondary:
    'bg-[var(--v2-bg-muted)] text-[var(--v2-text)] border border-[var(--v2-border)] hover:bg-[var(--v2-border)] hover:border-[var(--v2-border)]',
  ghost:
    'bg-transparent text-[var(--v2-text-secondary)] hover:bg-[var(--v2-bg-muted)] hover:text-[var(--v2-text)]',
  danger:
    'bg-[var(--v2-error-subtle)] text-[var(--v2-error-text)] border border-transparent hover:bg-[var(--v2-error)] hover:text-white',
  success:
    'bg-[var(--v2-success-subtle)] text-[var(--v2-success-text)] border border-transparent hover:bg-[var(--v2-success)] hover:text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[var(--v2-text-xs)] gap-1.5 rounded-[var(--v2-radius-sm)]',
  md: 'h-9 px-3.5 text-[var(--v2-text-sm)] gap-2 rounded-[var(--v2-radius-md)]',
  lg: 'h-11 px-5 text-[var(--v2-text-base)] gap-2.5 rounded-[var(--v2-radius-md)]',
};

const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    style={{ animation: 'v2-spin 0.6s linear infinite' }}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="2"
    />
    <path
      d="M14 8a6 6 0 0 0-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-[var(--v2-duration-normal)] ease-[var(--v2-ease-default)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--v2-bg)]',
          'select-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Spinner className={children ? 'mr-1.5' : ''} />
        ) : iconLeft ? (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
            {iconLeft}
          </span>
        ) : null}
        {children && <span className={loading ? 'opacity-70' : ''}>{children}</span>}
        {!loading && iconRight && (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
