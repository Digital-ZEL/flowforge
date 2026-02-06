'use client';

import React, { useEffect, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  gauge?: { score: number };
  color: 'brand' | 'emerald' | 'amber' | 'rose';
}

const COLOR_MAP = {
  brand: {
    bg: 'bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/40 dark:to-brand-900/20',
    border: 'border-brand-200/60 dark:border-brand-800/40',
    text: 'text-brand-700 dark:text-brand-300',
    iconBg: 'bg-brand-100 dark:bg-brand-900/50',
    iconColor: 'text-brand-600 dark:text-brand-400',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    text: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    text: 'text-rose-700 dark:text-rose-300',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
};

function GaugeRing({ score, size = 96 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700/50"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(animatedScore)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{animatedScore}</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, icon, trend, gauge, color }: MetricCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-5 sm:p-6 transition-shadow hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.iconBg} mb-3`}>
            <span className={c.iconColor}>{icon}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          {gauge ? (
            <div className="flex items-center gap-3">
              <GaugeRing score={gauge.score} size={80} />
              {subtitle && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>
              )}
            </div>
          ) : (
            <>
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
              )}
            </>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {trend.value >= 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
              {trend.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExecutiveMetricsProps {
  totalProcesses: number;
  healthScore: number;
  annualCost: string;
  complianceScore: number;
  healthLabel: string;
}

export default function ExecutiveMetrics({
  totalProcesses,
  healthScore,
  annualCost,
  complianceScore,
  healthLabel,
}: ExecutiveMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <MetricCard
        label="Total Processes"
        value={totalProcesses}
        subtitle="Active in organization"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        }
        trend={{ value: totalProcesses, label: `${totalProcesses} mapped` }}
        color="brand"
      />

      <MetricCard
        label="Organization Health"
        value=""
        subtitle={healthLabel}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        gauge={{ score: healthScore }}
        color="emerald"
      />

      <MetricCard
        label="Est. Annual Cost"
        value={annualCost}
        subtitle="Estimated process overhead"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="amber"
      />

      <MetricCard
        label="Compliance Score"
        value={`${complianceScore}%`}
        subtitle="Approved or reviewed"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        trend={{ value: complianceScore >= 50 ? 1 : -1, label: complianceScore >= 80 ? 'On track' : 'Needs attention' }}
        color="rose"
      />
    </div>
  );
}
