'use client';

import { useState, useMemo } from 'react';
import type { AnalysisResult } from '@/lib/types';

interface CostCalculatorProps {
  processes: AnalysisResult[];
}

interface ProcessCost {
  process: AnalysisResult;
  executionsPerYear: number;
  avgMinutesPerExecution: number;
  hourlyRate: number;
  annualCost: number;
}

// Estimate process complexity metrics from step count and types
function estimateProcessCost(process: AnalysisResult): ProcessCost {
  const steps = process.currentState.steps;
  const total = steps.length;
  const handoffs = steps.filter(s => s.type === 'handoff').length;
  const decisions = steps.filter(s => s.type === 'decision').length;
  const bottlenecks = process.currentState.bottlenecks.length;

  // Estimate executions/year based on industry
  const industry = process.industry.toLowerCase();
  let executionsPerYear: number;
  if (industry.includes('finance') || industry.includes('billing') || industry.includes('accounting')) {
    executionsPerYear = 2400; // ~10 per business day
  } else if (industry.includes('health') || industry.includes('medical')) {
    executionsPerYear = 5000;
  } else if (industry.includes('retail') || industry.includes('e-commerce') || industry.includes('ecommerce')) {
    executionsPerYear = 12000;
  } else if (industry.includes('tech') || industry.includes('software') || industry.includes('it')) {
    executionsPerYear = 1800;
  } else {
    executionsPerYear = 1200;
  }

  // Estimate avg minutes: base of 5min per step + handoff overhead + decision overhead
  const avgMinutesPerExecution = (total * 5) + (handoffs * 10) + (decisions * 3) + (bottlenecks * 8);

  // Estimate hourly rate
  const hourlyRate = 45;

  const annualCost = executionsPerYear * (avgMinutesPerExecution / 60) * hourlyRate;

  return {
    process,
    executionsPerYear,
    avgMinutesPerExecution,
    hourlyRate,
    annualCost,
  };
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function CostCalculator({ processes }: CostCalculatorProps) {
  const [optimizationRate, setOptimizationRate] = useState(45); // percentage savings

  const costs: ProcessCost[] = useMemo(() => {
    return processes.map(estimateProcessCost).sort((a, b) => b.annualCost - a.annualCost);
  }, [processes]);

  const totalAnnualCost = useMemo(() => costs.reduce((s, c) => s + c.annualCost, 0), [costs]);
  const potentialSavings = totalAnnualCost * (optimizationRate / 100);
  const roiMonths = totalAnnualCost > 0
    ? Math.ceil((totalAnnualCost * 0.15) / (potentialSavings / 12)) // assume 15% implementation cost
    : 0;

  const top5 = costs.slice(0, 5);

  // Find max for bar chart scaling
  const maxCost = top5.length > 0 ? top5[0].annualCost : 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Cost Analysis</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Estimated annual costs based on process complexity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Annual Cost</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalAnnualCost)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Across {processes.length} process{processes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Potential Savings</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(potentialSavings)}
          </p>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-500 mt-1">
            At {optimizationRate}% optimization
          </p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-950/30 rounded-xl p-4 border border-brand-200 dark:border-brand-800">
          <p className="text-xs text-brand-600 dark:text-brand-400 mb-1">ROI Timeline</p>
          <p className="text-xl sm:text-2xl font-bold text-brand-700 dark:text-brand-300">
            {roiMonths} mo
          </p>
          <p className="text-[10px] text-brand-500 dark:text-brand-500 mt-1">
            Estimated payback period
          </p>
        </div>
      </div>

      {/* Optimization Slider */}
      <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Optimization Level
          </label>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {optimizationRate}%
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={70}
          value={optimizationRate}
          onChange={(e) => setOptimizationRate(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-600"
          aria-label="Optimization percentage"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <span>Conservative (10%)</span>
          <span>Aggressive (70%)</span>
        </div>
      </div>

      {/* Top 5 Most Expensive Processes */}
      {top5.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Top {Math.min(5, top5.length)} Most Expensive Processes
          </h4>
          <div className="space-y-2.5">
            {top5.map((cost, i) => (
              <div key={cost.process.id} className="group">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-5 text-right font-mono">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <a
                        href={`/process/${cost.process.id}`}
                        className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {cost.process.title}
                      </a>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white ml-2 flex-shrink-0">
                        {formatCurrency(cost.annualCost)}/yr
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
                        style={{ width: `${(cost.annualCost / maxCost) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{cost.executionsPerYear.toLocaleString()} runs/yr</span>
                      <span>~{cost.avgMinutesPerExecution} min each</span>
                      <span>${cost.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
