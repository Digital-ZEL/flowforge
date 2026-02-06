'use client';

import React, { forwardRef, useId } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: 'h-8 text-[var(--v2-text-xs)] px-2.5',
  md: 'h-9 text-[var(--v2-text-sm)] px-3',
  lg: 'h-11 text-[var(--v2-text-base)] px-3.5',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconLeft,
      inputSize = 'md',
      fullWidth = true,
      disabled,
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const hasError = !!error;

    return (
      <div className={fullWidth ? 'w-full' : 'inline-flex flex-col'}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--v2-text-sm)] font-medium text-[var(--v2-text)] mb-[var(--v2-space-1-5)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-text-muted)] [&>svg]:w-4 [&>svg]:h-4 pointer-events-none"
              aria-hidden="true"
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={[
              'w-full rounded-[var(--v2-radius-md)]',
              'bg-[var(--v2-bg)] border',
              'text-[var(--v2-text)] placeholder:text-[var(--v2-text-muted)]',
              'transition-all duration-[var(--v2-duration-normal)] ease-[var(--v2-ease-default)]',
              'outline-none',
              hasError
                ? 'border-[var(--v2-error)] focus:ring-2 focus:ring-[var(--v2-error-subtle)]'
                : 'border-[var(--v2-border)] focus:border-[var(--v2-accent)] focus:ring-2 focus:ring-[var(--v2-accent-subtle)]',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              iconLeft ? 'pl-9' : '',
              sizeStyles[inputSize],
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {hasError && (
          <p id={errorId} className="mt-[var(--v2-space-1-5)] text-[var(--v2-text-xs)] text-[var(--v2-error-text)]" role="alert">
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className="mt-[var(--v2-space-1-5)] text-[var(--v2-text-xs)] text-[var(--v2-text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
