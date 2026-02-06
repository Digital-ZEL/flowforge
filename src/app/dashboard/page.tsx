'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProcessList } from '@/hooks/useProcess';
import { getSuggestedNextStep } from '@/lib/suggestions';
import { getFeedbackCount } from '@/lib/versionDb';
import type { AnalysisResult } from '@/lib/types';

function QuickStats({ processes }: { processes: AnalysisResult[] }) {
  const stats = useMemo(() => {
    if (processes.length === 0) return null;

    const totalBottlenecks = processes.reduce(
      (sum, p) => sum + p.currentState.bottlenecks.length, 0
    );

    // Most common bottleneck keywords
    const bottleneckWords: Record<string, number> = {};
    processes.forEach(p => {
      p.currentState.bottlenecks.forEach(b => {
        const words = ['manual', 'delay', 'review', 'compliance', 'paper', 'backlog', 'approval'];
        words.forEach(w => {
          if (b.reason.toLowerCase().includes(w)) {
            bottleneckWords[w] = (bottleneckWords[w] || 0) + 1;
          }
        });
      });
    });
    const topBottleneck = Object.entries(bottleneckWords).sort((a, b) => b[1] - a[1])[0];

    const avgOptions = processes.reduce((sum, p) => sum + p.options.length, 0) / processes.length;

    return {
      total: processes.length,
      topBottleneck: topBottleneck ? topBottleneck[0] : 'none found',
      avgOptimizations: avgOptions.toFixed(1),
    };
  }, [processes]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.total}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Processes</div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 capitalize">{stats.topBottleneck}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Most Common Bottleneck</div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgOptimizations}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg Options per Process</div>
      </div>
    </div>
  );
}

function ProcessCard({ 
  process, 
  onDelete,
  feedbackCount,
}: { 
  process: AnalysisResult; 
  onDelete: () => void;
  feedbackCount: number;
}) {
  const suggestion = getSuggestedNextStep(process);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all">
      <div className="flex items-start justify-between">
        <a href={`/process/${process.id}`} className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
            {process.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {process.currentProcess}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
              {process.industry}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(process.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-400">
              {process.options.length} optimization{process.options.length !== 1 ? 's' : ''}
            </span>
            {process.currentState.bottlenecks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-red-500">
                ⚠ {process.currentState.bottlenecks.length} bottleneck{process.currentState.bottlenecks.length !== 1 ? 's' : ''}
              </span>
            )}
            {feedbackCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium">
                💬 {feedbackCount}
              </span>
            )}
          </div>
          {/* Suggested next step */}
          <div className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium">
            💡 {suggestion}
          </div>
        </a>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (confirm('Delete this process map?')) onDelete();
          }}
          aria-label={`Delete ${process.title}`}
          className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { processes, loading, searchQuery, setSearchQuery, remove } = useProcessList();
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadFeedbackCounts() {
      const counts: Record<string, number> = {};
      for (const p of processes) {
        try {
          counts[p.id] = await getFeedbackCount(p.id);
        } catch {
          counts[p.id] = 0;
        }
      }
      setFeedbackCounts(counts);
    }
    if (processes.length > 0) {
      loadFeedbackCounts();
    }
  }, [processes]);

  // Group processes by industry
  const grouped = useMemo(() => {
    const groups: Record<string, AnalysisResult[]> = {};
    processes.forEach(p => {
      const key = p.industry || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [processes]);

  // Recently viewed
  const recentlyViewed = useMemo(() => {
    return [...processes]
      .filter(p => p.lastViewedAt)
      .sort((a, b) => new Date(b.lastViewedAt || 0).getTime() - new Date(a.lastViewedAt || 0).getTime())
      .slice(0, 3);
  }, [processes]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Your saved process maps
            </p>
          </div>
          <a
            href="/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm self-start"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Process
          </a>
        </div>

        {/* Quick Stats */}
        {!loading && processes.length > 0 && <QuickStats processes={processes} />}

        {/* Search */}
        {processes.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search processes"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>
        )}

        {/* Process List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="loading-shimmer h-5 w-48 rounded mb-3" />
                <div className="loading-shimmer h-4 w-72 rounded mb-2" />
                <div className="loading-shimmer h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : processes.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-20">
            {searchQuery ? (
              <>
                <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No processes match your search
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Try a different search term or clear the search
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transform rotate-6" />
                  <div className="absolute inset-0 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Create your first process map
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                  Describe your workflow and let AI analyze it, find bottlenecks, and suggest optimizations.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Process
                  </a>
                  <a
                    href="/demo"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
                  >
                    🎯 Try the Demo
                  </a>
                  <a
                    href="/templates"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
                  >
                    📋 Use a Template
                  </a>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && !searchQuery && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Recently Viewed
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentlyViewed.map((p) => (
                    <a
                      key={p.id}
                      href={`/process/${p.id}`}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
                    >
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {p.title}
                      </h4>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {p.industry} · {p.options.length} options
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Grouped by Industry */}
            {searchQuery ? (
              /* Flat list when searching */
              <div className="space-y-3">
                {processes.map((p) => (
                  <ProcessCard
                    key={p.id}
                    process={p}
                    onDelete={() => remove(p.id)}
                    feedbackCount={feedbackCounts[p.id] || 0}
                  />
                ))}
              </div>
            ) : (
              Object.entries(grouped).map(([industry, procs]) => (
                <div key={industry}>
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>{industry}</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {procs.length}
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {procs.map((p) => (
                      <ProcessCard
                        key={p.id}
                        process={p}
                        onDelete={() => remove(p.id)}
                        feedbackCount={feedbackCounts[p.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
