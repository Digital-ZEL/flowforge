'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllProcesses } from '@/lib/versionDb';
import { calculateHealthScore } from '@/lib/healthScore';
import type { AnalysisResult, HealthScore } from '@/lib/types';
import OrgMetrics from '@/components/OrgMetrics';
import RiskMatrix from '@/components/RiskMatrix';
import CostCalculator from '@/components/CostCalculator';

// Safely read optional fields that may not exist on AnalysisResult yet
function getDepartment(p: AnalysisResult): string {
  return (p as AnalysisResult & { department?: string }).department || p.industry || 'General';
}

function getRiskLevel(p: AnalysisResult): string {
  return (p as AnalysisResult & { riskLevel?: string }).riskLevel || 'unknown';
}

function getStatus(p: AnalysisResult): string {
  return (p as AnalysisResult & { status?: string }).status || 'active';
}

// Simple time-ago formatter
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Department bar chart - pure CSS
function DepartmentBreakdown({ departments }: { departments: { name: string; count: number; avgHealth: number }[] }) {
  const maxCount = Math.max(...departments.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Department Breakdown</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Process distribution and average health by department
      </p>
      {departments.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No data yet</p>
      ) : (
        <div className="space-y-3">
          {departments.map(dept => {
            const healthColor =
              dept.avgHealth >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
              dept.avgHealth >= 50 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400';
            return (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {dept.count} process{dept.count !== 1 ? 'es' : ''}
                    </span>
                    <span className={`text-[10px] font-semibold ${healthColor}`}>
                      {dept.avgHealth}% health
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Process count bar */}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                      style={{ width: `${(dept.count / maxCount) * 100}%` }}
                    />
                  </div>
                  {/* Health mini-gauge */}
                  <div className="w-12 flex-shrink-0">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          dept.avgHealth >= 80 ? 'bg-emerald-500' :
                          dept.avgHealth >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${dept.avgHealth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Activity feed
function ActivityFeed({ processes }: { processes: AnalysisResult[] }) {
  // Build activity events from creation and update timestamps
  const events = useMemo(() => {
    const items: { id: string; text: string; time: string; icon: string }[] = [];

    processes.forEach(p => {
      // Created
      items.push({
        id: `${p.id}-created`,
        text: `New process added: ${p.title}`,
        time: p.createdAt,
        icon: '🆕',
      });
      // Updated (if different from created)
      if (p.updatedAt && p.updatedAt !== p.createdAt) {
        items.push({
          id: `${p.id}-updated`,
          text: `${p.title} updated`,
          time: p.updatedAt,
          icon: '✏️',
        });
      }
      // Last viewed
      if (p.lastViewedAt) {
        items.push({
          id: `${p.id}-viewed`,
          text: `${p.title} viewed`,
          time: p.lastViewedAt,
          icon: '👁️',
        });
      }
    });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [processes]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Recent Activity</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Latest process events</p>
      {events.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="flex items-start gap-3">
              <span className="text-sm flex-shrink-0 mt-0.5">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate">
                  {event.text}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {timeAgo(event.time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgDashboardPage() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcesses()
      .then(setProcesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute health scores for all processes
  const healthScores = useMemo<Map<string, HealthScore>>(() => {
    const map = new Map();
    processes.forEach(p => {
      map.set(p.id, calculateHealthScore(p.currentState));
    });
    return map;
  }, [processes]);

  // Aggregate metrics
  const avgHealth = useMemo(() => {
    if (processes.length === 0) return 0;
    let sum = 0;
    healthScores.forEach(hs => { sum += hs.overall; });
    return Math.round(sum / processes.length);
  }, [processes, healthScores]);

  const highRiskCount = useMemo(() => {
    return processes.filter(p => {
      const risk = getRiskLevel(p);
      if (risk === 'high' || risk === 'critical') return true;
      // Fallback: health < 50 or lots of bottlenecks
      const hs = healthScores.get(p.id);
      return (hs && hs.overall < 50) || p.currentState.bottlenecks.length >= 3;
    }).length;
  }, [processes, healthScores]);

  const needsReviewCount = useMemo(() => {
    return processes.filter(p => {
      const status = getStatus(p);
      if (status === 'review' || status === 'needs-review') return true;
      const hs = healthScores.get(p.id);
      return hs !== undefined && hs.overall >= 50 && hs.overall < 70;
    }).length;
  }, [processes, healthScores]);

  // Department breakdown
  const departments = useMemo(() => {
    const map = new Map<string, { count: number; healthSum: number }>();
    processes.forEach(p => {
      const dept = getDepartment(p);
      const existing = map.get(dept) || { count: 0, healthSum: 0 };
      const hs = healthScores.get(p.id);
      existing.count++;
      existing.healthSum += hs?.overall ?? 50;
      map.set(dept, existing);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgHealth: Math.round(data.healthSum / data.count),
      }))
      .sort((a, b) => b.count - a.count);
  }, [processes, healthScores]);

  // Metrics cards data
  const metricsData = useMemo(() => [
    {
      label: 'Total Processes',
      value: processes.length,
      color: 'brand' as const,
      trend: 0,
      icon: (
        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
      ),
    },
    {
      label: 'Avg Health Score',
      value: avgHealth,
      format: 'percent' as const,
      color: avgHealth >= 70 ? ('emerald' as const) : avgHealth >= 50 ? ('amber' as const) : ('red' as const),
      trend: 0,
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: 'High Risk Processes',
      value: highRiskCount,
      color: highRiskCount > 0 ? ('red' as const) : ('emerald' as const),
      trend: 0,
      icon: (
        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      label: 'Needs Review',
      value: needsReviewCount,
      color: needsReviewCount > 0 ? ('amber' as const) : ('emerald' as const),
      trend: 0,
      icon: (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ], [processes.length, avgHealth, highRiskCount, needsReviewCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Organization Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Executive overview of all processes
            </p>
          </div>
          <div className="flex items-center gap-3 self-start">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Process List
            </a>
            <a
              href="/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Process
            </a>
          </div>
        </div>

        {processes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No processes yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Create your first process to see organization-wide analytics, risk assessment, and cost analysis.
            </p>
            <a
              href="/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Process
            </a>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Metrics Row */}
            <OrgMetrics metrics={metricsData} />

            {/* Risk Matrix + Cost Analysis - 2 column on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskMatrix processes={processes} />
              <CostCalculator processes={processes} />
            </div>

            {/* Department Breakdown + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentBreakdown departments={departments} />
              <ActivityFeed processes={processes} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
