import { getAllProcesses, saveProcess } from './versionDb';
import type { AnalysisResult } from './types';

const BACKUP_KEY = 'flowforge_backup';

export interface BackupData {
  version: 1;
  exportedAt: string;
  processes: AnalysisResult[];
}

/**
 * Export all IndexedDB processes to a JSON object.
 */
export async function exportData(): Promise<BackupData> {
  const processes = await getAllProcesses();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    processes,
  };
}

/**
 * Download all data as a JSON file.
 */
export async function downloadBackup(): Promise<void> {
  const data = await exportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `flowforge-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Import processes from a JSON backup file.
 * Returns the number of processes imported.
 */
export async function importData(file: File): Promise<number> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupData;
  
  if (!data.version || !Array.isArray(data.processes)) {
    throw new Error('Invalid backup file format');
  }
  
  let count = 0;
  for (const process of data.processes) {
    if (process.id && process.title && process.currentState) {
      await saveProcess(process);
      count++;
    }
  }
  
  return count;
}

/**
 * Auto-save current data to localStorage as a backup.
 */
export async function autoBackupToLocalStorage(): Promise<void> {
  try {
    const data = await exportData();
    const json = JSON.stringify(data);
    localStorage.setItem(BACKUP_KEY, json);
  } catch (err) {
    console.warn('[Backup] localStorage auto-backup failed:', err);
  }
}

/**
 * Restore from localStorage backup if IndexedDB is empty.
 */
export async function restoreFromLocalStorage(): Promise<number> {
  try {
    const json = localStorage.getItem(BACKUP_KEY);
    if (!json) return 0;
    
    const data = JSON.parse(json) as BackupData;
    if (!data.processes || data.processes.length === 0) return 0;
    
    const existing = await getAllProcesses();
    if (existing.length > 0) return 0; // Don't overwrite existing data
    
    let count = 0;
    for (const process of data.processes) {
      if (process.id && process.title) {
        await saveProcess(process);
        count++;
      }
    }
    
    return count;
  } catch (err) {
    console.warn('[Backup] localStorage restore failed:', err);
    return 0;
  }
}

/**
 * Estimate storage usage.
 */
export async function estimateStorageUsage(): Promise<{ used: string; quota: string } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const format = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };
      return {
        used: format(estimate.usage || 0),
        quota: format(estimate.quota || 0),
      };
    } catch {
      return null;
    }
  }
  return null;
}
