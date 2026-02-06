'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useProcess } from '@/hooks/useProcess';
import { getLayoutedElements } from '@/lib/layout';
import ComparisonTable from '@/components/ComparisonTable';

const FlowMap = dynamic(() => import('@/components/FlowMap'), { ssr: false });

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { process, loading, error } = useProcess(id);
  const [activeTab, setActiveTab] = useState(0);

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
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Process not found
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            This shared link may be invalid or the process has been removed.
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Clean header for sharing */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 print:border-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
              <svg className="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              FlowForge Process Map
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {process.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {process.industry}
              </span>
              <span>{new Date(process.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 print:hidden">
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

        {/* Option detail */}
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

        {/* Bottlenecks for current state */}
        {activeTab === 0 && process.currentState.bottlenecks.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Bottlenecks Identified
            </h3>
            <ul className="space-y-1">
              {process.currentState.bottlenecks.map((b, i) => (
                <li key={i} className="text-sm text-red-700 dark:text-red-300">
                  • {b.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Flow Map */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="h-[500px]">
            <FlowMap key={activeTab} initialNodes={nodes} initialEdges={edges} interactive={false} />
          </div>
        </div>

        {/* Comparison */}
        {process.comparison && process.comparison.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Comparison
              </h3>
            </div>
            <div className="p-5">
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
