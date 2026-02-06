'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const variantConfig: Record<ToastVariant, { icon: string; barColor: string; borderColor: string }> = {
  success: { icon: '✓', barColor: 'bg-[var(--v2-success)]', borderColor: 'border-l-[var(--v2-success)]' },
  error: { icon: '✕', barColor: 'bg-[var(--v2-error)]', borderColor: 'border-l-[var(--v2-error)]' },
  info: { icon: 'ℹ', barColor: 'bg-[var(--v2-info)]', borderColor: 'border-l-[var(--v2-info)]' },
  warning: { icon: '!', barColor: 'bg-[var(--v2-warning)]', borderColor: 'border-l-[var(--v2-warning)]' },
};

const ToastMessage: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const [exiting, setExiting] = useState(false);
  const duration = item.duration ?? 5000;
  const config = variantConfig[item.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    timerRef.current = setTimeout(() => onDismiss(item.id), 200);
  }, [item.id, onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, dismiss]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'relative overflow-hidden w-80',
        'bg-[var(--v2-bg-elevated)] border border-[var(--v2-border)] border-l-2',
        config.borderColor,
        'rounded-[var(--v2-radius-lg)] shadow-[var(--v2-shadow-lg)]',
        'pointer-events-auto',
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        animation: exiting
          ? undefined
          : 'v2-slide-in-right var(--v2-duration-slower) var(--v2-ease-out)',
        transition: `opacity var(--v2-duration-normal) var(--v2-ease-default), transform var(--v2-duration-normal) var(--v2-ease-default)`,
      }}
    >
      <div className="flex items-start gap-[var(--v2-space-3)] p-[var(--v2-space-4)]">
        <span
          className="shrink-0 w-5 h-5 flex items-center justify-center text-[var(--v2-text-xs)] font-bold"
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--v2-text-sm)] font-medium text-[var(--v2-text)]">{item.title}</p>
          {item.description && (
            <p className="mt-[var(--v2-space-1)] text-[var(--v2-text-xs)] text-[var(--v2-text-secondary)]">
              {item.description}
            </p>
          )}
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-[var(--v2-text-muted)] hover:text-[var(--v2-text)] rounded-[var(--v2-radius-sm)] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-0.5 w-full bg-[var(--v2-border-subtle)]">
          <div
            className={`h-full ${config.barColor} opacity-50`}
            style={{
              animation: `v2-progress-shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-[var(--v2-space-4)] right-[var(--v2-space-4)] flex flex-col gap-[var(--v2-space-3)] pointer-events-none"
        style={{ zIndex: 'var(--v2-z-toast)' }}
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastMessage key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';

export { ToastProvider, useToast };
export type { ToastItem, ToastVariant, ToastContextType };
