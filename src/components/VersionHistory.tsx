'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/types';
import {
  getVersions,
  saveProcess,
  saveVersion,
  type ProcessVersion,
} from '@/lib/versionDb';

interface VersionHistoryProps {
  process: AnalysisResult;
  onRestore: (restored: AnalysisResult) => void;
}

export default function VersionHistory({ process, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ProcessVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    const v = await getVersions(process.id);
    setVersions(v);
    setLoading(false);
  }, [process.id]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const restoreVersion = async (version: ProcessVersion) => {
    // Save current state as a version before restoring
    await saveVersion(process.id, process, 'Before restore');

    const restored: AnalysisResult = {
      ...version.snapshot,
      id: process.id,
      updatedAt: new Date().toISOString(),
    };
    await saveProcess(restored);
    onRestore(restored);
    await loadVersions();
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2 text-sm text-slate-500">Loading history...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-6 text-center">
        <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No version history yet. Versions are saved when you modify the process via AI chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((v) => (
        <div
          key={v.id}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            previewId === v.id
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-600'
              : 'border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800 bg-white dark:bg-slate-900'
          }`}
          onClick={() => setPreviewId(previewId === v.id ? null : v.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold flex-shrink-0">
                  v{v.version}
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {v.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8">
                {new Date(v.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {previewId === v.id && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                <p><strong>Title:</strong> {v.snapshot.title}</p>
                <p><strong>Steps:</strong> {v.snapshot.currentState.steps.length} current state steps</p>
                <p><strong>Options:</strong> {v.snapshot.options.length} optimization options</p>
                <p><strong>Bottlenecks:</strong> {v.snapshot.currentState.bottlenecks.length} identified</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Restore this version? Current state will be saved as a new version.')) {
                    restoreVersion(v);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restore This Version
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
