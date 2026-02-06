'use client';

import React, { useState, useMemo } from 'react';
import type { AnalysisResult, ComparisonMetric } from '@/lib/types';

interface ROICalculatorProps {
  process: AnalysisResult;
}

function parseTimeline(text: string): number | null {
  // Parse timeline strings like "4-6 weeks", "7-10 days", "2-3 hours"
  const lower = text.toLowerCase();
  const match = lower.match(/(\d+)[\s-]*(?:to\s*)?(\d+)?\s*(week|day|hour|month|min)/);
  if (!match) return null;

  const low = parseInt(match[1]);
  const high = match[2] ? parseInt(match[2]) : low;
  const avg = (low + high) / 2;
  const unit = match[3];

  // Convert to hours
  switch (unit) {
    case 'min': return avg / 60;
    case 'hour': return avg;
    case 'day': return avg * 8; // business hours
    case 'week': return avg * 40;
    case 'month': return avg * 160;
    default: return null;
  }
}

function findTimelineMetric(comparison: ComparisonMetric[]): ComparisonMetric | null {
  const timeKeywords = ['time', 'timeline', 'duration', 'days', 'weeks', 'processing'];
  return comparison.find(m => 
    timeKeywords.some(k => m.metric.toLowerCase().includes(k))
  ) || null;
}

export default function ROICalculator({ process }: ROICalculatorProps) {
  const [clientsPerYear, setClientsPerYear] = useState(200);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [implementationMonths, setImplementationMonths] = useState(6);

  const calculations = useMemo(() => {
    const timeMetric = findTimelineMetric(process.comparison);
    const currentHours = timeMetric ? parseTimeline(timeMetric.current) : null;

    return process.options.map((option, i) => {
      const optionKey = Object.keys(timeMetric || {}).find(k => 
        k !== 'metric' && k !== 'current' && 
        (k === option.name || k === `option${i + 1}`)
      );
      
      const optimizedValue = optionKey && timeMetric ? timeMetric[optionKey] : null;
      const optimizedHours = optimizedValue ? parseTimeline(optimizedValue) : null;

      // Estimate if we can't parse
      const currentH = currentHours || 80; // default 2-week process
      const optimizedH = optimizedHours || currentH * 0.4; // default 60% improvement

      const hoursSavedPerClient = Math.max(0, currentH - optimizedH);
      const annualHoursSaved = hoursSavedPerClient * clientsPerYear;
      const annualSavings = annualHoursSaved * hourlyRate;
      
      // Implementation cost estimate (rough)
      const implCost = implementationMonths * 15000; // rough estimate per month
      const paybackMonths = annualSavings > 0 ? Math.ceil((implCost / annualSavings) * 12) : 0;
      
      const year1Net = annualSavings - implCost;
      const year2Net = annualSavings;
      const year3Net = annualSavings;
      const threeYearTotal = year1Net + year2Net + year3Net;
      const roiPercent = implCost > 0 ? Math.round((threeYearTotal / implCost) * 100) : 0;

      return {
        name: option.name,
        hoursSavedPerClient: Math.round(hoursSavedPerClient),
        annualHoursSaved: Math.round(annualHoursSaved),
        annualSavings,
        implCost,
        paybackMonths,
        year1Net,
        year2Net,
        year3Net,
        threeYearTotal,
        roiPercent,
      };
    });
  }, [process, clientsPerYear, hourlyRate, implementationMonths]);

  const maxSavings = Math.max(...calculations.map(c => Math.max(c.annualSavings, c.implCost)));

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          📊 ROI Calculator
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Clients per Year
            </label>
            <input
              type="number"
              value={clientsPerYear}
              onChange={(e) => setClientsPerYear(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Avg Employee Hourly Cost ($)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Implementation Timeline (months)
            </label>
            <input
              type="number"
              value={implementationMonths}
              onChange={(e) => setImplementationMonths(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results per Option */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {calculations.map((calc, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <h4 className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-3">
              {calc.name}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Hours saved/client</span>
                <span className="font-semibold text-slate-900 dark:text-white">{calc.hoursSavedPerClient}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Annual hours saved</span>
                <span className="font-semibold text-slate-900 dark:text-white">{calc.annualHoursSaved.toLocaleString()}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Annual savings</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ${calc.annualSavings.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Est. implementation cost</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  ${calc.implCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Payback period</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {calc.paybackMonths} months
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">3-Year Total</span>
                <span className={`font-bold text-lg ${calc.threeYearTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${calc.threeYearTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">ROI</span>
                <span className={`font-bold ${calc.roiPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {calc.roiPercent}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Cost vs Savings — 3 Year Projection
        </h4>
        <div className="space-y-4">
          {calculations.map((calc, i) => (
            <div key={i}>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{calc.name}</div>
              <div className="space-y-1.5">
                {/* Implementation Cost Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-12 text-right">Cost</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-red-400 dark:bg-red-600 rounded-full transition-all duration-700 flex items-center pl-2"
                      style={{ width: `${maxSavings > 0 ? (calc.implCost / maxSavings) * 100 : 0}%`, minWidth: '2rem' }}
                    >
                      <span className="text-[10px] font-medium text-white whitespace-nowrap">
                        ${(calc.implCost / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
                {/* Year 1 Savings */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-12 text-right">Yr 1</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 flex items-center pl-2 ${calc.year1Net >= 0 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-amber-400 dark:bg-amber-600'}`}
                      style={{ width: `${maxSavings > 0 ? (Math.abs(calc.year1Net) / maxSavings) * 100 : 0}%`, minWidth: '2rem' }}
                    >
                      <span className="text-[10px] font-medium text-white whitespace-nowrap">
                        {calc.year1Net >= 0 ? '+' : '-'}${(Math.abs(calc.year1Net) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
                {/* Year 2 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-12 text-right">Yr 2</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 dark:bg-emerald-600 rounded-full transition-all duration-700 flex items-center pl-2"
                      style={{ width: `${maxSavings > 0 ? (calc.year2Net / maxSavings) * 100 : 0}%`, minWidth: '2rem' }}
                    >
                      <span className="text-[10px] font-medium text-white whitespace-nowrap">
                        +${(calc.year2Net / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
                {/* Year 3 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-12 text-right">Yr 3</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-500 rounded-full transition-all duration-700 flex items-center pl-2"
                      style={{ width: `${maxSavings > 0 ? (calc.year3Net / maxSavings) * 100 : 0}%`, minWidth: '2rem' }}
                    >
                      <span className="text-[10px] font-medium text-white whitespace-nowrap">
                        +${(calc.year3Net / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          * Estimates based on provided inputs. Implementation costs are approximate.
        </p>
      </div>
    </div>
  );
}
