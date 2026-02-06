'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllProcesses } from '@/lib/versionDb';
import { calculateHealthScore } from '@/lib/healthScore';
import type { AnalysisResult } from '@/lib/types';

type SortKey = 'newest' | 'oldest' | 'name' | 'health';
type StatusFilter = '' | 'draft' | 'in_review' | 'approved' | 'needs_update';

const DEPARTMENTS = ['All', 'Engineering', 'Operations', 'Finance', 'Legal', 'HR', 'Sales'];
const RISK_LEVELS = [
  { label: 'All', value: 0 },
  { label: 'Low (1-2)', value: 2 },
  { label: 'Medium (3)', value: 3 },
  { label: 'High (4-5)', value: 5 },
];

export default function V2Library() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllProcesses()
      .then(setProcesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...processes];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.currentProcess.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Status
    if (statusFilter) {
      result = result.filter((p) => (p.status || 'draft') === statusFilter);
    }

    // Department
    if (deptFilter !== 'All') {
      result = result.filter((p) => p.department === deptFilter);
    }

    // Risk
    if (riskFilter > 0) {
      if (riskFilter === 2) result = result.filter((p) => (p.riskLevel || 1) <= 2);
      else if (riskFilter === 3) result = result.filter((p) => (p.riskLevel || 1) === 3);
      else result = result.filter((p) => (p.riskLevel || 1) >= 4);
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'health':
          return (
            calculateHealthScore(b.currentState).overall -
            calculateHealthScore(a.currentState).overall
          );
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [processes, search, sort, statusFilter, deptFilter, riskFilter]);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Library</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--v2-text-muted)' }}>
            {processes.length} process{processes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Link
          href="/v2/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white self-start"
          style={{ background: 'var(--v2-primary)' }}
        >
          + New Process
        </Link>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--v2-text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processes…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
            style={{
              background: 'var(--v2-bg-input)',
              borderColor: 'var(--v2-border)',
              color: 'var(--v2-text)',
            }}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{
              background: 'var(--v2-bg-input)',
              borderColor: 'var(--v2-border)',
              color: 'var(--v2-text)',
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="health">Health</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{
              background: showFilters ? 'var(--v2-primary-muted)' : 'transparent',
              borderColor: showFilters ? 'var(--v2-primary)' : 'var(--v2-border)',
              color: showFilters ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter sidebar (collapsible) */}
      {showFilters && (
        <div
          className="rounded-xl border p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ background: 'var(--v2-bg-card)', borderColor: 'var(--v2-border)' }}
        >
          {/* Status */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--v2-text-secondary)' }}>
              Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['', 'draft', 'in_review', 'approved', 'needs_update'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    background: statusFilter === s ? 'var(--v2-primary-muted)' : 'transparent',
                    borderColor: statusFilter === s ? 'var(--v2-primary)' : 'var(--v2-border)',
                    color: statusFilter === s ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                  }}
                >
                  {s === '' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--v2-text-secondary)' }}>
              Department
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDeptFilter(d)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    background: deptFilter === d ? 'var(--v2-primary-muted)' : 'transparent',
                    borderColor: deptFilter === d ? 'var(--v2-primary)' : 'var(--v2-border)',
                    color: deptFilter === d ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Risk */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--v2-text-secondary)' }}>
              Risk Level
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RISK_LEVELS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRiskFilter(r.value)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    background: riskFilter === r.value ? 'var(--v2-primary-muted)' : 'transparent',
                    borderColor: riskFilter === r.value ? 'var(--v2-primary)' : 'var(--v2-border)',
                    color: riskFilter === r.value ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Process grid */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'var(--v2-border)' }}
        >
          <p className="text-lg mb-1">No processes found</p>
          <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
            {search ? 'Try a different search term.' : 'Create your first process to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProcessCard key={p.id} process={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Process Card ── */
function ProcessCard({ process }: { process: AnalysisResult }) {
  const health = calculateHealthScore(process.currentState).overall;
  const status = process.status || 'draft';
  const sc = {
    draft: { bg: 'var(--v2-info-muted)', text: 'var(--v2-info)' },
    in_review: { bg: 'var(--v2-warning-muted)', text: 'var(--v2-warning)' },
    approved: { bg: 'var(--v2-success-muted)', text: 'var(--v2-success)' },
    needs_update: { bg: 'var(--v2-danger-muted)', text: 'var(--v2-danger)' },
  }[status] || { bg: 'var(--v2-info-muted)', text: 'var(--v2-info)' };

  return (
    <Link
      href={`/v2/process/${process.id}`}
      className="rounded-xl border p-5 transition-colors block"
      style={{
        background: 'var(--v2-bg-card)',
        borderColor: 'var(--v2-border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold truncate">{process.title}</h3>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          style={{
            background: health >= 70 ? 'var(--v2-success-muted)' : health >= 40 ? 'var(--v2-warning-muted)' : 'var(--v2-danger-muted)',
            color: health >= 70 ? 'var(--v2-success)' : health >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)',
          }}
        >
          {health}%
        </span>
      </div>
      <p
        className="text-xs line-clamp-2 mb-3"
        style={{ color: 'var(--v2-text-secondary)' }}
      >
        {process.currentProcess}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: sc.bg, color: sc.text }}
          >
            {status.replace('_', ' ')}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
            {process.industry}
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
          {new Date(process.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
