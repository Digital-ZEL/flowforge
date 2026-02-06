'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProcesses } from '@/lib/versionDb';
import { DEPARTMENTS, SORT_OPTIONS } from '@/lib/categories';
import { calculateHealthScore } from '@/lib/healthScore';
import LibraryCard from '@/components/LibraryCard';
import type { AnalysisResult } from '@/lib/types';

type ViewMode = 'grid' | 'list';

export default function LibraryPage() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recently_updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    let cancelled = false;
    getAllProcesses()
      .then((all) => {
        if (!cancelled) {
          setProcesses(all);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    let result = [...processes];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.currentProcess.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          (p.owner && p.owner.toLowerCase().includes(q)) ||
          p.industry.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (selectedDepartment) {
      result = result.filter((p) => p.department === selectedDepartment);
    }

    return result;
  }, [processes, searchQuery, selectedDepartment]);

  // Sort
  const sorted = useMemo(() => {
    const featured = filtered.filter((p) => p.featured);
    const rest = filtered.filter((p) => !p.featured);

    const sortFn = (a: AnalysisResult, b: AnalysisResult) => {
      switch (sortBy) {
        case 'recently_updated': {
          const aTime = new Date(a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        }
        case 'health_score': {
          const aScore = calculateHealthScore(a.currentState).overall;
          const bScore = calculateHealthScore(b.currentState).overall;
          return bScore - aScore;
        }
        case 'risk_level': {
          return (b.riskLevel || 0) - (a.riskLevel || 0);
        }
        case 'alphabetical': {
          return a.title.localeCompare(b.title);
        }
        default:
          return 0;
      }
    };

    featured.sort(sortFn);
    rest.sort(sortFn);

    return [...featured, ...rest];
  }, [filtered, sortBy]);

  // Department counts for filter badges
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    processes.forEach((p) => {
      if (p.department) {
        counts[p.department] = (counts[p.department] || 0) + 1;
      }
    });
    return counts;
  }, [processes]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDepartment(null);
    setSortBy('recently_updated');
  }, []);

  const hasActiveFilters = searchQuery || selectedDepartment || sortBy !== 'recently_updated';

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Process Library
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
              {processes.length} process{processes.length !== 1 ? 'es' : ''} across your organization
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {/* View mode toggle */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <a
              href="/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </a>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, description, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search processes"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Department filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              !selectedDepartment
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            All
            <span className={`ml-1 text-[10px] ${!selectedDepartment ? 'text-brand-200' : 'text-slate-400'}`}>
              {processes.length}
            </span>
          </button>
          {DEPARTMENTS.map((dept) => {
            const count = deptCounts[dept.id] || 0;
            const isActive = selectedDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(isActive ? null : dept.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700'
                }`}
              >
                {dept.icon} {dept.label}
                {count > 0 && (
                  <span className={`ml-1 text-[10px] ${isActive ? 'text-brand-200' : 'text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort + clear */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-slate-500 dark:text-slate-400">Sort:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        {(searchQuery || selectedDepartment) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Showing {sorted.length} of {processes.length} processes
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="loading-shimmer h-5 w-32 rounded mb-3" />
                <div className="loading-shimmer h-4 w-48 rounded mb-2" />
                <div className="loading-shimmer h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            {processes.length === 0 ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transform rotate-6" />
                  <div className="absolute inset-0 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Your process library is empty
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  Create your first process to start building your organization&apos;s process library.
                </p>
                <a
                  href="/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Process
                </a>
              </>
            ) : (
              <>
                <svg className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No processes match your filters
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p) => (
              <LibraryCard key={p.id} process={p} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((p) => (
              <LibraryCard key={p.id} process={p} viewMode="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
