'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/Toast';

// Lazy import backup functions (client-side only)
async function getBackupModule() {
  return import('@/lib/backup');
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const [storageUsage, setStorageUsage] = useState<{ used: string; quota: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBackupModule().then(({ estimateStorageUsage }) => {
      estimateStorageUsage().then(setStorageUsage);
    });
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { downloadBackup } = await getBackupModule();
      await downloadBackup();
      addToast('success', 'Data exported successfully!');
    } catch (err) {
      addToast('error', `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const { importData } = await getBackupModule();
      const count = await importData(file);
      addToast('success', `Imported ${count} process${count !== 1 ? 'es' : ''} successfully!`);
    } catch (err) {
      addToast('error', `Import failed: ${err instanceof Error ? err.message : 'Invalid file'}`);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      // Clear IndexedDB
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
      // Clear localStorage backup
      localStorage.removeItem('flowforge_backup');
      addToast('success', 'All data cleared. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      addToast('error', `Clear failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Manage your data and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Storage Usage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Storage
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Your data is stored locally in your browser.
            </p>
            {storageUsage ? (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full"
                    style={{ width: '2%', minWidth: '4px' }}
                  />
                </div>
                <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {storageUsage.used} / {storageUsage.quota}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Unable to estimate storage</p>
            )}
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Data Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Export, import, or clear all your process maps.
            </p>

            <div className="space-y-4">
              {/* Export */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    Export All Data
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Download all processes as a JSON file
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  aria-label="Export all data"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {exporting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </>
                  )}
                </button>
              </div>

              {/* Import */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    Import Data
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload a FlowForge JSON backup file
                  </p>
                </div>
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[44px] ${
                    importing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {importing ? 'Importing...' : 'Import'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    aria-label="Choose backup file to import"
                  />
                </label>
              </div>

              {/* Clear All */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <div>
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-200">
                    Clear All Data
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    Permanently delete all processes and settings
                  </p>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  aria-label="Clear all data"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-[400px] max-w-[calc(100vw-2rem)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Delete all data?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              All your process maps, version history, and chat logs will be permanently deleted.
              Consider exporting your data first.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {clearing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Clearing...
                  </>
                ) : (
                  'Delete Everything'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
