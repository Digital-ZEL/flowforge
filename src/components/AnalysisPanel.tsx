'use client';

import React from 'react';
import type { Bottleneck, OptimizationOption } from '@/lib/types';

interface AnalysisPanelProps {
  bottlenecks: Bottleneck[];
  options: OptimizationOption[];
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export default function AnalysisPanel({
  bottlenecks,
  options,
  activeTab,
  onTabChange,
}: AnalysisPanelProps) {
  return (
    <div className="space-y-6">
      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && activeTab === 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-5 border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Bottlenecks Identified
          </h3>
          <ul className="space-y-2">
            {bottlenecks.map((b, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {b.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTabChange(0)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 0
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Current State
        </button>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onTabChange(i + 1)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === i + 1
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {/* Active Option Details */}
      {activeTab > 0 && options[activeTab - 1] && (
        <div className="bg-brand-50 dark:bg-brand-950/30 rounded-xl p-5 border border-brand-200 dark:border-brand-800">
          <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-200">
            {options[activeTab - 1].name}
          </h3>
          <p className="text-sm text-brand-700 dark:text-brand-400 mt-2">
            {options[activeTab - 1].description}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {options[activeTab - 1].improvement}
          </div>
        </div>
      )}
    </div>
  );
}
