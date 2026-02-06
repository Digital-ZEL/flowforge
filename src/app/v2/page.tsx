'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProcesses } from '@/lib/versionDb';
import { calculateHealthScore } from '@/lib/healthScore';
import type { AnalysisResult } from '@/lib/types';

export default function V2Dashboard() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcesses()
      .then(setProcesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const avgHealth =
    processes.length > 0
      ? Math.round(
          processes.reduce(
            (sum, p) => sum + calculateHealthScore(p.currentState).overall,
            0
          ) / processes.length
        )
      : 0;

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const thisWeek = processes.filter(
    (p) => new Date(p.createdAt) >= oneWeekAgo
  ).length;

  const actionItems = processes.filter(
    (p) => p.status === 'needs_update' || p.status === 'in_review'
  ).length;

  const recent = processes.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-[3px] rounded-full animate-spin"
          style={{
            borderColor: 'var(--v2-border)',
            borderTopColor: 'var(--v2-primary)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
          {dateStr}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Processes" value={processes.length} icon="📊" />
        <StatCard
          label="Avg Health"
          value={`${avgHealth}%`}
          icon="💚"
          color={avgHealth >= 70 ? 'var(--v2-success)' : avgHealth >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)'}
        />
        <StatCard label="This Week" value={thisWeek} icon="📅" />
        <StatCard label="Action Items" value={actionItems} icon="⚡" color={actionItems > 0 ? 'var(--v2-warning)' : undefined} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/v2/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: 'var(--v2-primary)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 5v14m7-7H5" />
          </svg>
          New Process
        </Link>
        <Link
          href="/v2/library"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--v2-border)', color: 'var(--v2-text-secondary)' }}
        >
          View Library
        </Link>
        <Link
          href="/v2/executive"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--v2-border)', color: 'var(--v2-text-secondary)' }}
        >
          Executive View
        </Link>
      </div>

      {/* Recent processes */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Processes</h2>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {recent.map((p) => (
              <ProcessRow key={p.id} process={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: 'var(--v2-bg-card)',
        borderColor: 'var(--v2-border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ color: color || 'var(--v2-text)' }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--v2-text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

/* ── Process row ── */
function ProcessRow({ process }: { process: AnalysisResult }) {
  const health = calculateHealthScore(process.currentState).overall;
  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'var(--v2-info-muted)', text: 'var(--v2-info)' },
    in_review: { bg: 'var(--v2-warning-muted)', text: 'var(--v2-warning)' },
    approved: { bg: 'var(--v2-success-muted)', text: 'var(--v2-success)' },
    needs_update: { bg: 'var(--v2-danger-muted)', text: 'var(--v2-danger)' },
  };
  const status = process.status || 'draft';
  const sc = statusColors[status] || statusColors.draft;

  return (
    <Link
      href={`/v2/process/${process.id}`}
      className="flex items-center gap-4 rounded-xl p-4 border transition-colors"
      style={{
        background: 'var(--v2-bg-card)',
        borderColor: 'var(--v2-border)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{process.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--v2-text-muted)' }}>
          {process.industry} · {new Date(process.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span
        className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
        style={{ background: sc.bg, color: sc.text }}
      >
        {status.replace('_', ' ')}
      </span>
      <span
        className="text-sm font-semibold w-12 text-right"
        style={{
          color: health >= 70 ? 'var(--v2-success)' : health >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)',
        }}
      >
        {health}%
      </span>
    </Link>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div
      className="rounded-xl border-2 border-dashed p-8 sm:p-12 text-center"
      style={{ borderColor: 'var(--v2-border)' }}
    >
      <div className="text-4xl mb-3">🚀</div>
      <h3 className="text-lg font-semibold mb-1">No processes yet</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--v2-text-muted)' }}>
        Create your first process to get started with AI-powered analysis.
      </p>
      <Link
        href="/v2/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: 'var(--v2-primary)' }}
      >
        Create First Process
      </Link>
    </div>
  );
}
