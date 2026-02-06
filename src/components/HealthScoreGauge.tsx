'use client';

import React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { calculateHealthScore, calculateOptionHealthScore, getScoreColor, getScoreLabel } from '@/lib/healthScore';

interface HealthScoreGaugeProps {
  process: AnalysisResult;
  activeTab: number;
}

function GaugeCircle({ score, size = 120 }: { score: number; size?: number }) {
  const colors = getScoreColor(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const colors = getScoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: colors.ring }}
        />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${colors.text}`}>{score}</span>
    </div>
  );
}

export default function HealthScoreGauge({ process, activeTab }: HealthScoreGaugeProps) {
  const currentScore = calculateHealthScore(process.currentState);
  
  const activeScore = activeTab === 0
    ? currentScore
    : calculateOptionHealthScore(process.options[activeTab - 1]);

  const colors = getScoreColor(activeScore.overall);

  return (
    <div className={`rounded-xl p-4 border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-4">
        <GaugeCircle score={activeScore.overall} size={100} />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${colors.text} mb-0.5`}>
            Process Health: {getScoreLabel(activeScore.overall)}
          </h4>
          <div className="space-y-2 mt-2">
            <ScoreBar label="Bottlenecks" score={activeScore.bottleneckScore} />
            <ScoreBar label="Handoffs" score={activeScore.handoffScore} />
            <ScoreBar label="Length" score={activeScore.lengthScore} />
            <ScoreBar label="Decisions" score={activeScore.decisionScore} />
          </div>
        </div>
      </div>
      
      {/* Show improvement if viewing an option */}
      {activeTab > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Your current process scores <strong className="text-slate-800 dark:text-slate-200">{currentScore.overall}</strong>.{' '}
            <strong className={colors.text}>{process.options[activeTab - 1]?.name}</strong> would improve it to{' '}
            <strong className={colors.text}>{activeScore.overall}</strong>.
            {activeScore.overall > currentScore.overall && (
              <span className="text-emerald-600 dark:text-emerald-400"> (+{activeScore.overall - currentScore.overall} points)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
