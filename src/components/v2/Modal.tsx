'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus first focusable element in dialog
      requestAnimationFrame(() => {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();
      });
    } else {
      previousFocusRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-[var(--v2-space-4)]"
      style={{ zIndex: 'var(--v2-z-modal)' }}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'v2-fade-in var(--v2-duration-normal) var(--v2-ease-out)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? 'modal-desc' : undefined}
        className={[
          'relative w-full',
          sizeStyles[size],
          'bg-[var(--v2-bg-subtle)] border border-[var(--v2-border)]',
          'rounded-[var(--v2-radius-xl)] shadow-[var(--v2-shadow-xl)]',
          'overflow-hidden',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          animation: 'v2-slide-up var(--v2-duration-slower) var(--v2-ease-out)',
        }}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-start justify-between p-[var(--v2-space-6)] pb-0">
            <div>
              {title && (
                <h2 className="text-[var(--v2-text-lg)] font-semibold text-[var(--v2-text)] tracking-[var(--v2-tracking-tight)]">
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-desc"
                  className="mt-[var(--v2-space-1)] text-[var(--v2-text-sm)] text-[var(--v2-text-secondary)]"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--v2-radius-md)] text-[var(--v2-text-muted)] hover:text-[var(--v2-text)] hover:bg-[var(--v2-bg-muted)] transition-colors duration-[var(--v2-duration-fast)]"
              aria-label="Close dialog"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-[var(--v2-space-6)] overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-[var(--v2-space-3)] p-[var(--v2-space-6)] pt-0 border-t border-[var(--v2-border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export { Modal };
export type { ModalProps };
