'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { analyzeProcess } from '@/lib/ai';
import { saveProcess } from '@/lib/versionDb';
import type { AnalysisResult } from '@/lib/types';

const INDUSTRIES = [
  { id: 'Wealth Management', label: 'Wealth Mgmt', icon: '💰' },
  { id: 'Banking', label: 'Banking', icon: '🏦' },
  { id: 'Insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'Legal', label: 'Legal', icon: '⚖️' },
  { id: 'Other', label: 'Other', icon: '🔧' },
];

const GOALS = [
  { id: 'reduce-time', label: 'Reduce time', icon: '⏱️' },
  { id: 'cut-costs', label: 'Cut costs', icon: '💵' },
  { id: 'improve-experience', label: 'Better CX', icon: '⭐' },
  { id: 'ensure-compliance', label: 'Compliance', icon: '✅' },
  { id: 'reduce-errors', label: 'Fewer errors', icon: '🎯' },
  { id: 'scale-operations', label: 'Scale ops', icon: '📈' },
];

const PROGRESS_MESSAGES = [
  'Analyzing your process…',
  'Identifying bottlenecks…',
  'Generating optimization options…',
  'Building process maps…',
];

export default function V2NewProcess() {
  const router = useRouter();
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    setProgressIdx(0);
    const timers = [
      setTimeout(() => setProgressIdx(1), 3000),
      setTimeout(() => setProgressIdx(2), 7000),
      setTimeout(() => setProgressIdx(3), 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const toggleGoal = (id: string) =>
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );

  const desiredOutcome = (): string => {
    const parts: string[] = [];
    const labels = selectedGoals
      .map((id) => GOALS.find((g) => g.id === id)?.label)
      .filter(Boolean);
    if (labels.length) parts.push(`Goals: ${labels.join(', ')}.`);
    return parts.join(' ') || 'Optimize this process for efficiency and reduce bottlenecks.';
  };

  const canAnalyze = industry !== '' && description.trim().length >= 20;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeProcess({
        currentProcess: description,
        desiredOutcome: desiredOutcome(),
        industry,
        goals: selectedGoals,
      });

      const id = uuidv4();
      const analysis: AnalysisResult = {
        id,
        title: result.title,
        currentProcess: description,
        desiredOutcome: desiredOutcome(),
        industry,
        currentState: result.currentState,
        options: result.options,
        comparison: result.comparison,
        goals: selectedGoals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProcess(analysis);
      router.push(`/v2/process/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  /* ── Loading overlay ── */
  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: 'var(--v2-primary-muted)' }}
            />
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--v2-primary)' }}
            >
              <svg className="animate-spin w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <p className="text-lg font-semibold mb-1">{PROGRESS_MESSAGES[progressIdx]}</p>
          <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
            Usually takes 15–30 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Create Process</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--v2-text-secondary)' }}>
        Describe your workflow and let AI analyze it in seconds.
      </p>

      <div className="space-y-8">
        {/* Industry pills */}
        <section>
          <label className="block text-sm font-semibold mb-3">
            Industry
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setIndustry(ind.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={{
                  background: industry === ind.id ? 'var(--v2-primary-muted)' : 'transparent',
                  borderColor: industry === ind.id ? 'var(--v2-primary)' : 'var(--v2-border)',
                  color: industry === ind.id ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                }}
              >
                <span>{ind.icon}</span>
                {ind.label}
              </button>
            ))}
          </div>
        </section>

        {/* Description */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold">
              Process Description
            </label>
            <span
              className="text-xs tabular-nums"
              style={{ color: description.length >= 20 ? 'var(--v2-text-muted)' : 'var(--v2-warning)' }}
            >
              {description.length} chars {description.length < 20 && '(min 20)'}
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed resize-none outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--v2-bg-input)',
              borderColor: 'var(--v2-border)',
              color: 'var(--v2-text)',
            }}
            placeholder="Walk through your current workflow step by step. Include who's involved, where delays happen, and any pain points…"
          />
        </section>

        {/* Goals */}
        <section>
          <label className="block text-sm font-semibold mb-3">
            Goals <span className="font-normal" style={{ color: 'var(--v2-text-muted)' }}>(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all"
                style={{
                  background: selectedGoals.includes(g.id) ? 'var(--v2-primary-muted)' : 'transparent',
                  borderColor: selectedGoals.includes(g.id) ? 'var(--v2-primary)' : 'var(--v2-border)',
                  color: selectedGoals.includes(g.id) ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
                }}
              >
                <span>{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 border flex items-start gap-3 text-sm"
            style={{
              background: 'var(--v2-danger-muted)',
              borderColor: 'var(--v2-danger)',
              color: 'var(--v2-danger)',
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p>{error}</p>
              <button onClick={handleAnalyze} className="underline mt-1 font-medium">
                Try Again →
              </button>
            </div>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canAnalyze
              ? 'linear-gradient(135deg, var(--v2-primary), #7c3aed)'
              : 'var(--v2-border)',
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Analyze Process
        </button>
      </div>
    </div>
  );
}
