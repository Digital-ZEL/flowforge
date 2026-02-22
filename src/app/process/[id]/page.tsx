'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import dynamic from 'next/dynamic';
import { useProcess } from '@/hooks/useProcess';
import { updateLastViewed } from '@/lib/versionDb';
import AnalysisPanel from '@/components/AnalysisPanel';
import ComparisonTable from '@/components/ComparisonTable';
const ExportButton = dynamic(() => import('@/components/ExportButton'), { ssr: false });
import VersionHistory from '@/components/VersionHistory';
import HealthScoreGauge from '@/components/HealthScoreGauge';
import SmartSuggestions from '@/components/SmartSuggestions';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { AnalysisResult } from '@/lib/types';

const FlowMap = dynamic(() => import('@/components/FlowMap'), { ssr: false });
const SwimLaneMap = dynamic(() => import('@/components/SwimLaneMap'), { ssr: false });
const ProcessChat = dynamic(() => import('@/components/ProcessChat'), { ssr: false });
const ROICalculator = dynamic(() => import('@/components/ROICalculator'), { ssr: false });
const AuditTrail = dynamic(() => import('@/components/AuditTrail'), { ssr: false });
const ApprovalWorkflow = dynamic(() => import('@/components/ApprovalWorkflow'), { ssr: false });

type ViewMode = 'flowchart' | 'swimlane';
type RightTab = 'map' | 'roi' | 'history' | 'audit';

export default function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { process: initialProcess, loading, error } = useProcess(id);
  const [process, setProcess] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('flowchart');
  const [rightTab, setRightTab] = useState<RightTab>('map');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [collabUrl, setCollabUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCollab, setCopiedCollab] = useState(false);
  const chatRef = useRef<{ openWithMessage: (msg: string) => void } | null>(null);
  const [auditRefreshKey, setAuditRefreshKey] = useState(0);
  const [layoutedData, setLayoutedData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [layoutSteps, setLayoutSteps] = useState<any[]>([]);
  const [layoutBottlenecks, setLayoutBottlenecks] = useState<any[]>([]);

  useEffect(() => {
    if (initialProcess) {
      setProcess(initialProcess);
    }
  }, [initialProcess]);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      setShareUrl(`${window.location.origin}/share/${id}`);
      setCollabUrl(`${window.location.origin}/collaborate/${id}`);
      // Update last viewed
      updateLastViewed(id).catch(() => {});
    }
  }, [id]);

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCollabLink = () => {
    if (collabUrl) {
      navigator.clipboard.writeText(collabUrl);
      setCopiedCollab(true);
      setTimeout(() => setCopiedCollab(false), 2000);
    }
  };

  const handleProcessUpdate = useCallback((updated: AnalysisResult) => {
    setProcess(updated);
  }, []);

  const handleSuggestionClick = useCallback((chatPrompt: string) => {
    if (chatRef.current) {
      chatRef.current.openWithMessage(chatPrompt);
    }
  }, []);

  useEffect(() => {
    if (!process) return;
    let cancelled = false;
    import('@/lib/layout').then(({ getLayoutedElements }) => {
      if (cancelled) return;
      if (activeTab === 0) {
        setLayoutedData(getLayoutedElements(process.currentState.steps, process.currentState.bottlenecks));
        setLayoutSteps(process.currentState.steps);
        setLayoutBottlenecks(process.currentState.bottlenecks);
      } else {
        const option = process.options[activeTab - 1];
        if (option) {
          setLayoutedData(getLayoutedElements(option.steps));
          setLayoutSteps(option.steps);
          setLayoutBottlenecks([]);
        } else {
          setLayoutedData({ nodes: [], edges: [] });
          setLayoutSteps([]);
          setLayoutBottlenecks([]);
        }
      }
    });
    return () => { cancelled = true; };
  }, [process, activeTab]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading process...</p>
        </div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Process not found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error || 'This process may have been deleted or the link is invalid.'}
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const layouted = layoutedData;
  const steps = layoutSteps;
  const bottlenecks = layoutBottlenecks;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {process.title}
              </h1>
              {process.status && process.status !== 'draft' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  process.status === 'approved'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : process.status === 'in_review'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : process.status === 'needs_update'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {process.status === 'approved' ? '✅ Approved' :
                   process.status === 'in_review' ? '👁️ In Review' :
                   process.status === 'needs_update' ? '🔄 Needs Update' :
                   process.status}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {process.industry}
              </span>
              <span>{new Date(process.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ExportButton
              filename={`flowforge-${process.title.toLowerCase().replace(/\s+/g, '-')}`}
              process={process}
            />
            <button
              onClick={copyShareLink}
              aria-label="Share process"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={copyCollabLink}
              aria-label="Collaboration link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              💬 {copiedCollab ? 'Link Copied!' : 'Collaborate'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Health Score */}
            <HealthScoreGauge process={process} activeTab={activeTab} />
            
            {/* Analysis Panel */}
            <AnalysisPanel
              bottlenecks={process.currentState.bottlenecks}
              options={process.options}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Smart Suggestions (only for current state) */}
            {activeTab === 0 && (
              <SmartSuggestions process={process} onSuggestionClick={handleSuggestionClick} />
            )}

            {/* Right Tab Selector */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setRightTab('map')}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  rightTab === 'map'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setRightTab('roi')}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  rightTab === 'roi'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                📊 ROI
              </button>
              <button
                onClick={() => setRightTab('history')}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  rightTab === 'history'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                🕐 History
              </button>
              <button
                onClick={() => setRightTab('audit')}
                className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  rightTab === 'audit'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                📋 Audit
              </button>
            </div>

            {/* Version History Panel (inline when on that tab) */}
            {rightTab === 'history' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Version History
                </h3>
                <VersionHistory process={process} onRestore={handleProcessUpdate} />
              </div>
            )}

            {/* Approval Workflow */}
            <ApprovalWorkflow
              process={process}
              onProcessUpdate={handleProcessUpdate}
              onAuditChange={() => setAuditRefreshKey((k) => k + 1)}
            />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2">
            {rightTab === 'map' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {activeTab === 0
                      ? 'Current State Map'
                      : process.options[activeTab - 1]?.name + ' — Process Map'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode('flowchart')}
                        aria-label="Flowchart view"
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          viewMode === 'flowchart'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Flowchart
                      </button>
                      <button
                        onClick={() => setViewMode('swimlane')}
                        aria-label="Swimlane view"
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          viewMode === 'swimlane'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Swimlane
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 hidden sm:block">
                      {layouted.nodes.length} steps · {layouted.edges.length} connections
                    </div>
                  </div>
                </div>
                <div className="h-[400px] sm:h-[500px] lg:h-[500px] touch-pan-x touch-pan-y">
                  <ErrorBoundary fallbackTitle="Failed to render process map">
                    {viewMode === 'flowchart' ? (
                      <FlowMap
                        key={`flow-${activeTab}`}
                        initialNodes={layouted.nodes}
                        initialEdges={layouted.edges}
                      />
                    ) : (
                      <SwimLaneMap
                        key={`swim-${activeTab}`}
                        steps={steps}
                        bottlenecks={bottlenecks}
                      />
                    )}
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {rightTab === 'roi' && (
              <ErrorBoundary fallbackTitle="Failed to load ROI Calculator">
                <ROICalculator process={process} />
              </ErrorBoundary>
            )}

            {rightTab === 'history' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Current Process Map
                  </h3>
                </div>
                <div className="h-[400px] sm:h-[500px]">
                  <ErrorBoundary fallbackTitle="Failed to render process map">
                    <FlowMap
                      key={`flow-current-${process.updatedAt}`}
                      initialNodes={layouted.nodes}
                      initialEdges={layouted.edges}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {rightTab === 'audit' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4">
                  <AuditTrail processId={id} refreshKey={auditRefreshKey} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {process.comparison && process.comparison.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Comparison: Current vs Optimized
              </h3>
            </div>
            <div className="p-3 sm:p-5 overflow-x-auto">
              <ComparisonTable comparison={process.comparison} options={process.options} />
            </div>
          </div>
        )}
      </div>

      {/* AI Chat */}
      <ErrorBoundary fallbackTitle="Chat failed to load">
        <ProcessChat process={process} onProcessUpdate={handleProcessUpdate} ref={chatRef} />
      </ErrorBoundary>
    </div>
  );
}
