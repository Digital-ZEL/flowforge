'use client';

import React from 'react';
import type { ComparisonMetric, OptimizationOption } from '@/lib/types';

interface ComparisonTableProps {
  comparison: ComparisonMetric[];
  options: OptimizationOption[];
}

export default function ComparisonTable({ comparison, options }: ComparisonTableProps) {
  if (!comparison || comparison.length === 0) return null;

  const optionKeys = options.map((_, i) => `option${i + 1}`);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
              Metric
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
              Current State
            </th>
            {options.map((opt, i) => (
              <th
                key={i}
                className="text-left py-3 px-4 font-semibold text-brand-600 dark:text-brand-400"
              >
                {opt.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                {row.metric}
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.current}</td>
              {optionKeys.map((key, j) => (
                <td key={j} className="py-3 px-4 text-brand-700 dark:text-brand-300 font-medium">
                  {row[key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
