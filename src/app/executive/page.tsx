'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllProcesses } from '@/lib/versionDb';
import { calculateHealthScore, getScoreLabel } from '@/lib/healthScore';
import type { AnalysisResult } from '@/lib/types';
import ExecutiveMetrics from '@/components/ExecutiveMetrics';
import ProcessHealthGrid from '@/components/ProcessHealthGrid';

// ── Health score calculation per task spec ──────────────────────────
function computeExecutiveHealth(process: AnalysisResult): number {
  const { steps, bottlenecks } = process.currentState;
  let score = 100;

  // -15 per bottleneck
  score -= bottlenecks.length * 15;

  // -10 per handoff step
  const handoffs = steps.filter(s => s.type === 'handoff').length;
  score -= handoffs * 10;

  // -5 if more than 10 steps
  if (steps.length > 10) {
    score -= 5;
  }

  // -10 per decision node beyond 2
  const decisions = steps.filter(s => s.type === 'decision').length;
  if (decisions > 2) {
    score -= (decisions - 2) * 10;
  }

  return Math.max(0, Math.min(100, score));
}

// ── SVG Donut Chart ─────────────────────────────────────────────────
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, size = 180 }: { segments: DonutSegment[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-xs text-slate-400">No data</p>
      </div>
    );
  }

  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLength = pct * circumference;
          const dashOffset = -cumulativeOffset;
          cumulativeOffset += dashLength;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">TOTAL</span>
      </div>
    </div>
  );
}

// ── Department Bar Chart (pure CSS) ─────────────────────────────────
function DepartmentBarChart({ departments }: { departments: { name: string; avgScore: number; count: number }[] }) {
  if (departments.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 italic">No department data</p>;
  }

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      {departments.map((dept) => (
        <div key={dept.name} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {dept.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">{dept.count} process{dept.count !== 1 ? 'es' : ''}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right">{dept.avgScore}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${getBarColor(dept.avgScore)} transition-all duration-700`}
              style={{ width: `${dept.avgScore}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Action Item Component ──────────────────────────────────────────
function ActionItem({ process, reason, icon }: { process: AnalysisResult; reason: string; icon: string }) {
  return (
    <a
      href={`/process/${process.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {process.title}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{reason}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

// ── Main Executive Dashboard ────────────────────────────────────────
export default function ExecutiveDashboard() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcesses()
      .then(setProcesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compute all derived data
  const {
    healthScores,
    avgHealth,
    healthLabel,
    complianceScore,
    annualCost,
    gridTiles,
    departments,
    complianceSegments,
    actionItems,
  } = useMemo(() => {
    // Health scores per process
    const healthScores = processes.map(p => ({
      process: p,
      score: computeExecutiveHealth(p),
      detailedScore: calculateHealthScore(p.currentState),
    }));

    // Average health
    const avgHealth = processes.length > 0
      ? Math.round(healthScores.reduce((sum, h) => sum + h.score, 0) / processes.length)
      : 0;

    const healthLabel = getScoreLabel(avgHealth);

    // Compliance: % of processes that are approved or in_review
    const compliantCount = processes.filter(p => p.status === 'approved' || p.status === 'in_review').length;
    const complianceScore = processes.length > 0
      ? Math.round((compliantCount / processes.length) * 100)
      : 0;

    // Estimated annual cost (rough: $5k per step across all processes)
    const totalSteps = processes.reduce((sum, p) => sum + p.currentState.steps.length, 0);
    const annualCostNum = totalSteps * 5000;
    const annualCost = annualCostNum >= 1_000_000
      ? `$${(annualCostNum / 1_000_000).toFixed(1)}M`
      : annualCostNum >= 1_000
        ? `$${(annualCostNum / 1_000).toFixed(0)}K`
        : `$${annualCostNum}`;

    // Grid tiles
    const gridTiles = healthScores.map(h => ({
      id: h.process.id,
      name: h.process.title,
      department: h.process.department || h.process.industry || 'General',
      healthScore: h.score,
    })).sort((a, b) => a.healthScore - b.healthScore); // worst first

    // Department performance
    const deptMap: Record<string, { total: number; count: number }> = {};
    healthScores.forEach(h => {
      const dept = h.process.department || h.process.industry || 'General';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
      deptMap[dept].total += h.score;
      deptMap[dept].count += 1;
    });
    const departments = Object.entries(deptMap)
      .map(([name, { total, count }]) => ({
        name,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    // Compliance segments for donut
    const statusCounts = { approved: 0, in_review: 0, draft: 0, needs_update: 0 };
    processes.forEach(p => {
      const s = p.status || 'draft';
      if (s in statusCounts) statusCounts[s as keyof typeof statusCounts]++;
    });
    const complianceSegments: DonutSegment[] = [
      { label: 'Approved', value: statusCounts.approved, color: '#10b981' },
      { label: 'In Review', value: statusCounts.in_review, color: '#6366f1' },
      { label: 'Draft', value: statusCounts.draft, color: '#94a3b8' },
      { label: 'Needs Update', value: statusCounts.needs_update, color: '#f59e0b' },
    ];

    // Action items
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const needsReview = processes.filter(p => p.status === 'needs_update');
    const highRisk = processes.filter(p => (p.riskLevel || 0) >= 4);
    const recentlyChanged = processes.filter(p => {
      const updated = new Date(p.updatedAt).getTime();
      return now - updated < sevenDays;
    });

    const actionItems = {
      needsReview,
      highRisk,
      recentlyChanged,
    };

    return {
      healthScores,
      avgHealth,
      healthLabel,
      complianceScore,
      annualCost,
      gridTiles,
      departments,
      complianceSegments,
      actionItems,
    };
  }, [processes]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading executive view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
                Your Organization
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Operational Intelligence
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-brand-500/30 via-brand-500/10 to-transparent" />
        </div>

        {/* ── Empty state ──────────────────────────────────────── */}
        {processes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No processes yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Create process maps to see your organizational intelligence dashboard.
            </p>
            <a
              href="/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Create First Process
            </a>
          </div>
        ) : (
          <>
            {/* ── Hero Metrics ────────────────────────────────── */}
            <ExecutiveMetrics
              totalProcesses={processes.length}
              healthScore={avgHealth}
              annualCost={annualCost}
              complianceScore={complianceScore}
              healthLabel={healthLabel}
            />

            {/* ── Process Health Grid ─────────────────────────── */}
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Process Health Grid</h2>
                <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 80+</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 60-79</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> 40-59</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &lt;40</span>
                </div>
              </div>
              <ProcessHealthGrid processes={gridTiles} />
            </section>

            {/* ── Two-column layout: Department + Action Items ── */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                  Department Performance
                </h2>
                <DepartmentBarChart departments={departments} />
              </section>

              {/* Action Items */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Action Items
                </h2>

                {actionItems.needsReview.length === 0 &&
                 actionItems.highRisk.length === 0 &&
                 actionItems.recentlyChanged.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic py-4">
                    ✅ No action items — all processes look good!
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {actionItems.needsReview.map(p => (
                      <ActionItem key={`review-${p.id}`} process={p} reason="Needs review" icon="📋" />
                    ))}
                    {actionItems.highRisk.map(p => (
                      <ActionItem key={`risk-${p.id}`} process={p} reason={`Risk level ${p.riskLevel}/5`} icon="⚠️" />
                    ))}
                    {actionItems.recentlyChanged.map(p => (
                      <ActionItem key={`recent-${p.id}`} process={p} reason={`Updated ${new Date(p.updatedAt).toLocaleDateString()}`} icon="🔄" />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Compliance Summary ──────────────────────────── */}
            <section className="mt-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Compliance Summary
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <DonutChart segments={complianceSegments} size={180} />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {complianceSegments.map((seg) => {
                    const pct = processes.length > 0
                      ? Math.round((seg.value / processes.length) * 100)
                      : 0;
                    return (
                      <div key={seg.label} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {seg.value} <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{seg.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
