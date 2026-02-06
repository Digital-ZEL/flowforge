'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllProcesses } from '@/lib/versionDb';
import { calculateHealthScore, getScoreLabel } from '@/lib/healthScore';
import type { AnalysisResult } from '@/lib/types';

export default function V2Executive() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcesses()
      .then(setProcesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    if (processes.length === 0) {
      return {
        total: 0,
        avgHealth: 0,
        approved: 0,
        needsUpdate: 0,
        inReview: 0,
        departments: {} as Record<string, { count: number; avgHealth: number }>,
        healthBuckets: { excellent: 0, good: 0, fair: 0, critical: 0 },
        actionItems: [] as { title: string; status: string; id: string }[],
      };
    }

    const healthScores = processes.map((p) => calculateHealthScore(p.currentState).overall);
    const avgHealth = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length);

    const departments: Record<string, { count: number; totalHealth: number }> = {};
    processes.forEach((p) => {
      const dept = p.department || 'Unassigned';
      if (!departments[dept]) departments[dept] = { count: 0, totalHealth: 0 };
      departments[dept].count++;
      departments[dept].totalHealth += calculateHealthScore(p.currentState).overall;
    });

    const deptMetrics: Record<string, { count: number; avgHealth: number }> = {};
    for (const [key, val] of Object.entries(departments)) {
      deptMetrics[key] = { count: val.count, avgHealth: Math.round(val.totalHealth / val.count) };
    }

    const buckets = { excellent: 0, good: 0, fair: 0, critical: 0 };
    healthScores.forEach((s) => {
      if (s >= 80) buckets.excellent++;
      else if (s >= 60) buckets.good++;
      else if (s >= 40) buckets.fair++;
      else buckets.critical++;
    });

    const actionItems = processes
      .filter((p) => p.status === 'needs_update' || p.status === 'in_review')
      .slice(0, 10)
      .map((p) => ({ title: p.title, status: p.status || 'draft', id: p.id }));

    return {
      total: processes.length,
      avgHealth,
      approved: processes.filter((p) => p.status === 'approved').length,
      needsUpdate: processes.filter((p) => p.status === 'needs_update').length,
      inReview: processes.filter((p) => p.status === 'in_review').length,
      departments: deptMetrics,
      healthBuckets: buckets,
      actionItems,
    };
  }, [processes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-[3px] rounded-full animate-spin"
          style={{ borderColor: 'var(--v2-border)', borderTopColor: 'var(--v2-primary)' }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero metrics */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Executive Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
          Organization-wide process health overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard label="Total Processes" value={metrics.total} />
        <MetricCard
          label="Avg Health"
          value={`${metrics.avgHealth}%`}
          subtitle={getScoreLabel(metrics.avgHealth)}
          color={metrics.avgHealth >= 70 ? 'var(--v2-success)' : metrics.avgHealth >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)'}
        />
        <MetricCard label="Approved" value={metrics.approved} color="var(--v2-success)" />
        <MetricCard label="In Review" value={metrics.inReview} color="var(--v2-warning)" />
        <MetricCard label="Needs Update" value={metrics.needsUpdate} color="var(--v2-danger)" />
      </div>

      {/* Health grid + departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Health distribution */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--v2-bg-card)', borderColor: 'var(--v2-border)' }}
        >
          <h2 className="text-sm font-semibold mb-4">Health Distribution</h2>
          <div className="space-y-3">
            {[
              { label: 'Excellent (80-100)', count: metrics.healthBuckets.excellent, color: 'var(--v2-success)' },
              { label: 'Good (60-79)', count: metrics.healthBuckets.good, color: '#22d3ee' },
              { label: 'Fair (40-59)', count: metrics.healthBuckets.fair, color: 'var(--v2-warning)' },
              { label: 'Critical (<40)', count: metrics.healthBuckets.critical, color: 'var(--v2-danger)' },
            ].map((bucket) => {
              const pct = metrics.total > 0 ? (bucket.count / metrics.total) * 100 : 0;
              return (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--v2-text-secondary)' }}>{bucket.label}</span>
                    <span className="font-semibold" style={{ color: bucket.color }}>
                      {bucket.count}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--v2-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: bucket.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department breakdown */}
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--v2-bg-card)', borderColor: 'var(--v2-border)' }}
        >
          <h2 className="text-sm font-semibold mb-4">Departments</h2>
          {Object.keys(metrics.departments).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
              No department data available.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(metrics.departments)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([dept, data]) => (
                  <div
                    key={dept}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ borderColor: 'var(--v2-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium">{dept}</p>
                      <p className="text-xs" style={{ color: 'var(--v2-text-muted)' }}>
                        {data.count} process{data.count !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: data.avgHealth >= 70 ? 'var(--v2-success)' : data.avgHealth >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)',
                      }}
                    >
                      {data.avgHealth}%
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Action items */}
      <div
        className="rounded-xl border p-5"
        style={{ background: 'var(--v2-bg-card)', borderColor: 'var(--v2-border)' }}
      >
        <h2 className="text-sm font-semibold mb-4">Action Items</h2>
        {metrics.actionItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
              No action items — everything looks good!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.actionItems.map((item) => {
              const sc = item.status === 'needs_update'
                ? { bg: 'var(--v2-danger-muted)', text: 'var(--v2-danger)' }
                : { bg: 'var(--v2-warning-muted)', text: 'var(--v2-warning)' };
              return (
                <a
                  key={item.id}
                  href={`/v2/process/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--v2-border)' }}
                >
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ml-3"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--v2-bg-card)', borderColor: 'var(--v2-border)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--v2-text-muted)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: color || 'var(--v2-text)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--v2-text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
