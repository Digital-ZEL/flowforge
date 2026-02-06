'use client';

import { useState, useMemo } from 'react';
import type { AnalysisResult } from '@/lib/types';

interface RiskMatrixProps {
  processes: AnalysisResult[];
}

// Maps riskLevel (1-5) to a likelihood column (1-5)
function getLikelihood(process: AnalysisResult): number {
  if (process.riskLevel && process.riskLevel >= 1 && process.riskLevel <= 5) {
    return process.riskLevel;
  }
  // Infer from bottleneck count
  const bn = process.currentState.bottlenecks.length;
  if (bn >= 4) return 5;
  if (bn >= 3) return 4;
  if (bn >= 2) return 3;
  if (bn >= 1) return 2;
  return 1;
}

// Compute impact score from process complexity and handoff/decision density
function getImpact(process: AnalysisResult): number {
  const steps = process.currentState.steps;
  const total = steps.length;
  if (total === 0) return 1;

  const handoffs = steps.filter(s => s.type === 'handoff').length;
  const decisions = steps.filter(s => s.type === 'decision').length;
  const bottlenecks = process.currentState.bottlenecks.length;

  // Weighted score out of 5
  const score = (handoffs * 1.5 + decisions * 1.0 + bottlenecks * 2.0 + total * 0.2);
  if (score >= 10) return 5;
  if (score >= 7) return 4;
  if (score >= 4) return 3;
  if (score >= 2) return 2;
  return 1;
}

// Zone color for a given (likelihood, impact) cell
function getCellZone(likelihood: number, impact: number): 'green' | 'yellow' | 'red' | 'darkred' {
  const score = likelihood * impact;
  if (score >= 16) return 'darkred';
  if (score >= 10) return 'red';
  if (score >= 5) return 'yellow';
  return 'green';
}

const zoneBgClass = {
  green: 'bg-emerald-100/60 dark:bg-emerald-900/20',
  yellow: 'bg-amber-100/60 dark:bg-amber-900/20',
  red: 'bg-red-100/60 dark:bg-red-900/20',
  darkred: 'bg-red-200/80 dark:bg-red-900/40',
};

const dotColorClass = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  darkred: 'bg-red-700 dark:bg-red-600',
};

interface PlottedProcess {
  process: AnalysisResult;
  likelihood: number;
  impact: number;
  zone: 'green' | 'yellow' | 'red' | 'darkred';
}

export default function RiskMatrix({ processes }: RiskMatrixProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const plotted: PlottedProcess[] = useMemo(() => {
    return processes.map(p => {
      const likelihood = getLikelihood(p);
      const impact = getImpact(p);
      return {
        process: p,
        likelihood,
        impact,
        zone: getCellZone(likelihood, impact),
      };
    });
  }, [processes]);

  // Group by cell
  const cellMap = useMemo(() => {
    const map = new Map<string, PlottedProcess[]>();
    plotted.forEach(pp => {
      const key = `${pp.likelihood}-${pp.impact}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pp);
    });
    return map;
  }, [plotted]);

  const yLabels = ['Severe', 'Major', 'Moderate', 'Minor', 'Negligible'];
  const xLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Risk Matrix</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {processes.length} process{processes.length !== 1 ? 'es' : ''} plotted by risk &amp; impact
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-700" />Critical</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[340px]">
          {/* Y-axis label */}
          <div className="flex">
            <div className="w-16 sm:w-20 flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 -rotate-90 whitespace-nowrap">
                ← Impact
              </span>
            </div>
            <div className="flex-1">
              {/* Grid rows: impact 5 (top) to 1 (bottom) */}
              {[5, 4, 3, 2, 1].map(impact => (
                <div key={impact} className="flex">
                  {/* Y label */}
                  <div className="w-14 sm:w-16 flex-shrink-0 flex items-center justify-end pr-2">
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                      {yLabels[5 - impact]}
                    </span>
                  </div>
                  {/* Cells */}
                  <div className="flex-1 grid grid-cols-5 gap-0.5">
                    {[1, 2, 3, 4, 5].map(likelihood => {
                      const zone = getCellZone(likelihood, impact);
                      const cellProcs = cellMap.get(`${likelihood}-${impact}`) || [];
                      return (
                        <div
                          key={`${likelihood}-${impact}`}
                          className={`${zoneBgClass[zone]} h-14 sm:h-16 rounded-md flex flex-wrap items-center justify-center gap-1 p-1 relative border border-slate-200/50 dark:border-slate-700/30`}
                        >
                          {cellProcs.map((pp, idx) => (
                            <div key={pp.process.id} className="relative">
                              <a
                                href={`/process/${pp.process.id}`}
                                className={`block w-4 h-4 sm:w-5 sm:h-5 rounded-full ${dotColorClass[pp.zone]} border-2 border-white dark:border-slate-900 shadow-sm hover:scale-125 transition-transform cursor-pointer`}
                                onMouseEnter={() => setHoveredId(pp.process.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                aria-label={`View ${pp.process.title}`}
                              />
                              {hoveredId === pp.process.id && (
                                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] sm:text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                                  {pp.process.title}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                                </div>
                              )}
                            </div>
                          ))}
                          {cellProcs.length === 0 && (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">
                              {likelihood * impact}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* X-axis labels */}
              <div className="flex mt-1">
                <div className="w-14 sm:w-16 flex-shrink-0" />
                <div className="flex-1 grid grid-cols-5 gap-0.5">
                  {xLabels.map(label => (
                    <div key={label} className="text-center">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center mt-1">
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
                  Likelihood →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
