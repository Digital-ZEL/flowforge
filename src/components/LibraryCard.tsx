'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { getDepartment, getProcessStatus } from '@/lib/categories';
import { calculateHealthScore, getScoreColor, getScoreLabel } from '@/lib/healthScore';

interface LibraryCardProps {
  process: AnalysisResult;
  viewMode: 'grid' | 'list';
}

function MiniGauge({ score, size = 44 }: { score: number; size?: number }) {
  const colors = getScoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${colors.text}`}>{score}</span>
      </div>
    </div>
  );
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function LibraryCard({ process, viewMode }: LibraryCardProps) {
  const healthScore = calculateHealthScore(process.currentState);
  const dept = process.department ? getDepartment(process.department) : null;
  const status = process.status ? getProcessStatus(process.status) : null;
  const stepCount = process.currentState.steps.length;
  const updatedAt = process.updatedAt || process.createdAt;

  if (viewMode === 'list') {
    return (
      <a
        href={`/process/${process.id}`}
        className="group flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
      >
        {/* Health gauge */}
        <MiniGauge score={healthScore.overall} size={44} />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
              {process.featured && <span className="mr-1">⭐</span>}
              {process.title}
            </h3>
            {status && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color} ${status.bgColor}`}>
                {status.icon} {status.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {process.currentProcess}
          </p>
        </div>

        {/* Department badge */}
        {dept && (
          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${dept.color} ${dept.bgColor} flex-shrink-0`}>
            {dept.icon} {dept.label}
          </span>
        )}

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
          {process.owner && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-[10px] font-bold text-brand-600 dark:text-brand-400">
                {process.owner.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[80px]">{process.owner}</span>
            </div>
          )}
          <span>{stepCount} steps</span>
          <span className="whitespace-nowrap">{relativeTime(updatedAt)}</span>
        </div>
      </a>
    );
  }

  // Grid view
  return (
    <a
      href={`/process/${process.id}`}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all relative"
    >
      {/* Featured star */}
      {process.featured && (
        <span className="absolute top-3 right-3 text-amber-400 text-sm">⭐</span>
      )}

      {/* Top row: gauge + title */}
      <div className="flex items-start gap-3">
        <MiniGauge score={healthScore.overall} size={48} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-tight">
            {process.title}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {getScoreLabel(healthScore.overall)} · {stepCount} steps
          </p>
        </div>
      </div>

      {/* Department + Status row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {dept && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${dept.color} ${dept.bgColor}`}>
            {dept.icon} {dept.label}
          </span>
        )}
        {status && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color} ${status.bgColor}`}>
            {status.icon} {status.label}
          </span>
        )}
      </div>

      {/* Bottom row: owner + updated */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {process.owner ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-[10px] font-bold text-brand-600 dark:text-brand-400">
              {process.owner.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
              {process.owner}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">No owner</span>
        )}
        <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {relativeTime(updatedAt)}
        </span>
      </div>
    </a>
  );
}
