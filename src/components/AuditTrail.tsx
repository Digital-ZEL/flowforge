'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuditLog, exportAuditLog, type AuditEntry, type AuditAction } from '@/lib/audit';

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string; icon: string }> = {
  created: { label: 'Created', color: 'bg-green-500', icon: '✨' },
  edited: { label: 'Edited', color: 'bg-blue-500', icon: '✏️' },
  reviewed: { label: 'Reviewed', color: 'bg-yellow-500', icon: '👁️' },
  approved: { label: 'Approved', color: 'bg-emerald-500', icon: '✅' },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: '❌' },
  submitted_for_review: { label: 'Submitted for Review', color: 'bg-brand-500', icon: '📤' },
  requested_changes: { label: 'Requested Changes', color: 'bg-orange-500', icon: '🔄' },
  status_changed: { label: 'Status Changed', color: 'bg-purple-500', icon: '🔀' },
};

const ALL_ACTIONS: AuditAction[] = [
  'created', 'edited', 'reviewed', 'approved', 'rejected',
  'submitted_for_review', 'requested_changes', 'status_changed',
];

interface AuditTrailProps {
  processId: string;
  refreshKey?: number;
}

export default function AuditTrail({ processId, refreshKey }: AuditTrailProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [exportCopied, setExportCopied] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const log = await getAuditLog(processId);
      setEntries(log);
    } catch (err) {
      console.error('Failed to load audit log:', err);
    } finally {
      setLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, refreshKey]);

  const handleExport = async () => {
    try {
      const text = await exportAuditLog(processId);
      await navigator.clipboard.writeText(text);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    } catch (err) {
      console.error('Failed to export audit log:', err);
    }
  };

  const filtered = filterAction === 'all'
    ? entries
    : entries.filter((e) => e.action === filterAction);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter and export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | 'all')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {ACTION_CONFIG[a].icon} {ACTION_CONFIG[a].label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {exportCopied ? 'Copied!' : 'Export Audit Log'}
        </button>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {entries.length === 0 ? 'No audit entries yet.' : 'No entries match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-0">
            {filtered.map((entry, index) => {
              const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.edited;
              const date = new Date(entry.timestamp);
              return (
                <div key={entry.id} className="relative flex gap-3 py-3 group">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 w-[31px] flex items-start justify-center pt-0.5">
                    <div className={`w-3 h-3 rounded-full ${config.color} ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {config.icon} {config.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        by {entry.user}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {entry.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
