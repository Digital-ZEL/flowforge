'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { getProcess, getAllProcesses, saveProcess, deleteProcess, searchProcesses } from '@/lib/versionDb';

export function useProcess(id?: string) {
  const [process, setProcess] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getProcess(id)
      .then((p) => {
        if (!cancelled) {
          setProcess(p || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { process, loading, error };
}

export function useProcessList() {
  const [processes, setProcesses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = searchQuery
        ? await searchProcesses(searchQuery)
        : await getAllProcesses();
      setProcesses(results);
    } catch (err) {
      console.error('Failed to load processes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteProcess(id);
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const save = useCallback(async (process: AnalysisResult) => {
    await saveProcess(process);
    await refresh();
  }, [refresh]);

  return { processes, loading, searchQuery, setSearchQuery, refresh, remove, save };
}
