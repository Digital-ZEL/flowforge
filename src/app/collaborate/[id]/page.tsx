'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProcess } from '@/hooks/useProcess';
import { getLayoutedElements } from '@/lib/layout';
import { saveFeedback, getFeedback } from '@/lib/versionDb';
import { calculateHealthScore, getScoreColor, getScoreLabel } from '@/lib/healthScore';
import ComparisonTable from '@/components/ComparisonTable';
import type { FeedbackComment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const FlowMap = dynamic(() => import('@/components/FlowMap'), { ssr: false });

export default function CollaboratePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { process, loading, error } = useProcess(id);
  const [activeTab, setActiveTab] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackComment[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);

  useEffect(() => {
    // Check for ?feedback=true in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsFeedbackMode(params.get('feedback') === 'true');
    }
  }, []);

  useEffect(() => {
    if (isFeedbackMode && id) {
      getFeedback(id).then(setFeedbackList).catch(() => {});
    }
  }, [isFeedbackMode, id]);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;

    const comment: FeedbackComment = {
      id: uuidv4(),
      processId: id,
      author: feedbackAuthor.trim() || 'Anonymous',
      comment: feedbackText.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveFeedback(comment);
    setFeedbackList(prev => [comment, ...prev]);
    setFeedbackText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading shared process...</p>
        </div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Process not found
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            This collaboration link may be invalid or the process has been removed.
          </p>
        </div>
      </div>
    );
  }

  const getFlowData = () => {
    if (activeTab === 0) {
      return getLayoutedElements(process.currentState.steps, process.currentState.bottlenecks);
    }
    const option = process.options[activeTab - 1];
    return option ? getLayoutedElements(option.steps) : { nodes: [], edges: [] };
  };

  const { nodes, edges } = getFlowData();
  const healthScore = calculateHealthScore(process.currentState);
  const scoreColors = getScoreColor(healthScore.overall);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
              <svg className="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              FlowForge Collaboration
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {process.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {process.industry}
              </span>
              <span>{new Date(process.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Health Score Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${scoreColors.bg} border ${scoreColors.border}`}>
              <span className={`text-lg font-bold ${scoreColors.text}`}>{healthScore.overall}</span>
              <span className={`text-xs font-medium ${scoreColors.text}`}>{getScoreLabel(healthScore.overall)}</span>
            </div>
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              💬 Leave Feedback
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Feedback Panel */}
        {showFeedback && (
          <div className="mb-6 bg-brand-50 dark:bg-brand-950/30 rounded-2xl border border-brand-200 dark:border-brand-800 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Leave Feedback
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={feedbackAuthor}
                onChange={(e) => setFeedbackAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
              />
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts, questions, or suggestions about this process..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  Submit Feedback
                </button>
                {submitted && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Feedback submitted!
                  </span>
                )}
              </div>
            </div>

            {/* Show existing feedback (only in feedback mode) */}
            {isFeedbackMode && feedbackList.length > 0 && (
              <div className="mt-6 pt-4 border-t border-brand-200 dark:border-brand-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Previous Feedback ({feedbackList.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {feedbackList.map((fb) => (
                    <div key={fb.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{fb.author}</span>
                        <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 0
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Current State
          </button>
          {process.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i + 1)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === i + 1
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>

        {/* Option Details */}
        {activeTab > 0 && process.options[activeTab - 1] && (
          <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800">
            <h3 className="font-semibold text-brand-900 dark:text-brand-200">
              {process.options[activeTab - 1].name}
            </h3>
            <p className="text-sm text-brand-700 dark:text-brand-400 mt-1">
              {process.options[activeTab - 1].description}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              {process.options[activeTab - 1].improvement}
            </span>
          </div>
        )}

        {/* Bottlenecks */}
        {activeTab === 0 && process.currentState.bottlenecks.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Bottlenecks Identified</h3>
            <ul className="space-y-1">
              {process.currentState.bottlenecks.map((b, i) => (
                <li key={i} className="text-sm text-red-700 dark:text-red-300">• {b.reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Flow Map */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="h-[400px] sm:h-[500px]">
            <FlowMap key={activeTab} initialNodes={nodes} initialEdges={edges} interactive={false} />
          </div>
        </div>

        {/* Comparison Table */}
        {process.comparison && process.comparison.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Comparison</h3>
            </div>
            <div className="p-3 sm:p-5 overflow-x-auto">
              <ComparisonTable comparison={process.comparison} options={process.options} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          Generated by FlowForge · AI Process Mapper
        </div>
      </div>
    </div>
  );
}
