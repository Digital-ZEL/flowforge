'use client';

import React from 'react';

type TrendDirection = 'up' | 'down' | 'neutral';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  trendValue?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

const trendConfig: Record<TrendDirection, { color: string; arrow: string; ariaLabel: string }> = {
  up: { color: 'text-[var(--v2-success-text)]', arrow: '↑', ariaLabel: 'trending up' },
  down: { color: 'text-[var(--v2-error-text)]', arrow: '↓', ariaLabel: 'trending down' },
  neutral: { color: 'text-[var(--v2-text-muted)]', arrow: '→', ariaLabel: 'no change' },
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  icon,
  gradient = false,
  className = '',
  ...props
}) => {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <div
      className={[
        'relative overflow-hidden',
        'rounded-[var(--v2-radius-lg)] border border-[var(--v2-border-subtle)]',
        'bg-[var(--v2-bg-subtle)] p-[var(--v2-space-6)]',
        'transition-all duration-[var(--v2-duration-slow)] ease-[var(--v2-ease-default)]',
        'hover:border-[var(--v2-border)] hover:shadow-[var(--v2-shadow-sm)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, var(--v2-accent) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--v2-text-sm)] font-medium text-[var(--v2-text-muted)] mb-[var(--v2-space-2)]">
            {label}
          </p>
          <p className="text-[var(--v2-text-3xl)] font-bold text-[var(--v2-text)] tracking-[var(--v2-tracking-tight)] leading-none">
            {value}
          </p>
          {trendInfo && trendValue && (
            <div
              className={`flex items-center gap-1 mt-[var(--v2-space-3)] text-[var(--v2-text-sm)] font-medium ${trendInfo.color}`}
              aria-label={`${trendValue} ${trendInfo.ariaLabel}`}
            >
              <span aria-hidden="true">{trendInfo.arrow}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="shrink-0 w-10 h-10 rounded-[var(--v2-radius-md)] bg-[var(--v2-accent-subtle)] text-[var(--v2-accent)] flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

MetricCard.displayName = 'MetricCard';

export { MetricCard };
export type { MetricCardProps, TrendDirection };
