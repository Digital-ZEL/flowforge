'use client';

import { useEffect, useState } from 'react';

interface MetricCard {
  label: string;
  value: number;
  format?: 'number' | 'percent' | 'currency';
  trend?: number; // positive = up, negative = down
  color: 'brand' | 'emerald' | 'red' | 'amber';
  icon: React.ReactNode;
}

interface OrgMetricsProps {
  metrics: MetricCard[];
}

const colorMap = {
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-950/30',
    border: 'border-brand-200 dark:border-brand-800',
    text: 'text-brand-600 dark:text-brand-400',
    iconBg: 'bg-brand-100 dark:bg-brand-900/50',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
};

function AnimatedCounter({ target, format }: { target: number; format?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        // Ease-out curve
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(eased * target));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  if (format === 'percent') return <>{current}%</>;
  if (format === 'currency') return <>${current.toLocaleString()}</>;
  return <>{current.toLocaleString()}</>;
}

export default function OrgMetrics({ metrics }: OrgMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, i) => {
        const colors = colorMap[metric.color];
        return (
          <div
            key={metric.label}
            className={`${colors.bg} border ${colors.border} rounded-xl p-4 sm:p-5 transition-all hover:shadow-md animate-fade-in-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${colors.iconBg} rounded-lg p-2`}>
                {metric.icon}
              </div>
              {metric.trend !== undefined && metric.trend !== 0 && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    metric.trend > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <svg
                    className={`w-3 h-3 ${metric.trend < 0 ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  {Math.abs(metric.trend)}%
                </div>
              )}
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
              <AnimatedCounter target={metric.value} format={metric.format} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {metric.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
