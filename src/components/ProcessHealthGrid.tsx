'use client';

import React from 'react';

interface ProcessTile {
  id: string;
  name: string;
  department: string;
  healthScore: number;
}

interface ProcessHealthGridProps {
  processes: ProcessTile[];
}

function getHealthColor(score: number) {
  if (score >= 80) return {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    label: 'Healthy',
  };
  if (score >= 60) return {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    label: 'Needs Attention',
  };
  if (score >= 40) return {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-300 dark:border-orange-700',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    label: 'At Risk',
  };
  return {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-300 dark:border-red-700',
    hoverBorder: 'hover:border-red-400 dark:hover:border-red-600',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
    label: 'Critical',
  };
}

export default function ProcessHealthGrid({ processes }: ProcessHealthGridProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400 dark:text-slate-500">No processes to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {processes.map((proc) => {
        const colors = getHealthColor(proc.healthScore);
        return (
          <a
            key={proc.id}
            href={`/process/${proc.id}`}
            className={`group relative rounded-xl border-2 ${colors.border} ${colors.hoverBorder} ${colors.bg} p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
          >
            {/* Health indicator dot */}
            <div className="flex items-center justify-between mb-2">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className={`text-lg font-bold ${colors.text}`}>{proc.healthScore}</span>
            </div>

            {/* Process name */}
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {proc.name}
            </h4>

            {/* Department tag */}
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.badge}`}>
              {proc.department || 'Unassigned'}
            </span>

            {/* Health label */}
            <p className={`text-[10px] mt-1 ${colors.text} font-medium`}>{colors.label}</p>
          </a>
        );
      })}
    </div>
  );
}
