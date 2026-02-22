'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import dynamic from 'next/dynamic';
import { useProcess } from '@/hooks/useProcess';
import { updateLastViewed } from '@/lib/versionDb';
import { calculateHealthScore, getScoreLabel } from '@/lib/healthScore';
import type { AnalysisResult } from '@/lib/types';
import ComparisonTable from '@/components/ComparisonTable';
import ErrorBoundary from '@/components/ErrorBoundary';

const FlowMap = dynamic(() => import('@/components/FlowMap'), { ssr: false });
const SwimLaneMap = dynamic(() => import('@/components/SwimLaneMap'), { ssr: false });
const ProcessChat = dynamic(() => import('@/components/ProcessChat'), { ssr: false });
const AuditTrail = dynamic(() => import('@/components/AuditTrail'), { ssr: false });
const ExportButton = dynamic(() => import('@/components/ExportButton'), { ssr: false });

type TabKey = 'flow' | 'options' | 'compare' | 'chat' | 'audit';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'flow', label: 'Flow Map', icon: '🗺️' },
  { key: 'options', label: 'Options', icon: '⚡' },
  { key: 'compare', label: 'Compare', icon: '📊' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'audit', label: 'Audit', icon: '📋' },
];

export default function V2ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { process: initialProcess, loading, error } = useProcess(id);
  const [process, setProcess] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('flow');
  const [selectedOption, setSelectedOption] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'flowchart' | 'swimlane'>('flowchart');
  const chatRef = useRef<{ openWithMessage: (msg: string) => void } | null>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProcess) setProcess(initialProcess);
  }, [initialProcess]);

  useEffect(() => {
    if (id) updateLastViewed(id).catch(() => {});
  }, [id]);

  const health = process ? calculateHealthScore(process.currentState) : null;

  const handleProcessUpdate = useCallback((updated: AnalysisResult) => {
    setProcess(updated);
  }, []);

  /* ── Loading / Error states ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-[3px] rounded-full animate-spin"
          style={{ borderColor: 'var(--v2-border)', borderTopColor: 'var(--v2-primary)' }}
        />
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold mb-2">Process not found</p>
        <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
          {error || 'The process you are looking for does not exist.'}
        </p>
      </div>
    );
  }

  const status = process.status || 'draft';
  const statusColor = {
    draft: { bg: 'var(--v2-info-muted)', text: 'var(--v2-info)' },
    in_review: { bg: 'var(--v2-warning-muted)', text: 'var(--v2-warning)' },
    approved: { bg: 'var(--v2-success-muted)', text: 'var(--v2-success)' },
    needs_update: { bg: 'var(--v2-danger-muted)', text: 'var(--v2-danger)' },
  }[status] || { bg: 'var(--v2-info-muted)', text: 'var(--v2-info)' };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b"
        style={{ borderColor: 'var(--v2-border)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold truncate">{process.title}</h1>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: statusColor.bg, color: statusColor.text }}
            >
              {status.replace('_', ' ')}
            </span>
            {health && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: health.overall >= 70 ? 'var(--v2-success-muted)' : health.overall >= 40 ? 'var(--v2-warning-muted)' : 'var(--v2-danger-muted)',
                  color: health.overall >= 70 ? 'var(--v2-success)' : health.overall >= 40 ? 'var(--v2-warning)' : 'var(--v2-danger)',
                }}
              >
                Health: {health.overall}% · {getScoreLabel(health.overall)}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--v2-text-muted)' }}>
            {process.industry} · Created {new Date(process.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportButton
            targetRef={flowContainerRef}
            process={process}
          />
          <button
            onClick={() => {
              const url = `${window.location.origin}/share/${process.id}`;
              navigator.clipboard.writeText(url);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: 'var(--v2-border)', color: 'var(--v2-text-secondary)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-white"
            style={{ background: chatOpen ? 'var(--v2-primary-hover)' : 'var(--v2-primary)' }}
          >
            💬 Chat
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b overflow-x-auto"
        style={{ borderColor: 'var(--v2-border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.key === 'chat') {
                setChatOpen(!chatOpen);
              } else {
                setActiveTab(tab.key);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--v2-primary-muted)' : 'transparent',
              color: activeTab === tab.key ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
            }}
          >
            <span className="text-xs">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}

        {activeTab === 'flow' && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setViewMode('flowchart')}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'flowchart' ? 'var(--v2-primary-muted)' : 'transparent',
                color: viewMode === 'flowchart' ? 'var(--v2-primary-light)' : 'var(--v2-text-muted)',
              }}
            >
              Flowchart
            </button>
            <button
              onClick={() => setViewMode('swimlane')}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'swimlane' ? 'var(--v2-primary-muted)' : 'transparent',
                color: viewMode === 'swimlane' ? 'var(--v2-primary-light)' : 'var(--v2-text-muted)',
              }}
            >
              Swim Lane
            </button>
          </div>
        )}
      </div>

      {/* Content + optional chat panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main content */}
        <div className={`flex-1 overflow-y-auto transition-all ${chatOpen ? 'mr-0 sm:mr-[380px]' : ''}`}>
          <ErrorBoundary>
            {activeTab === 'flow' && (
              <FlowTabContent
                process={process}
                viewMode={viewMode}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                containerRef={flowContainerRef}
              />
            )}

            {activeTab === 'options' && (
              <OptionsTab process={process} selectedOption={selectedOption} onSelect={setSelectedOption} />
            )}

            {activeTab === 'compare' && (
              <div className="p-4 sm:p-6">
                <ComparisonTable comparison={process.comparison} options={process.options} />
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="p-4 sm:p-6">
                <AuditTrail processId={process.id} refreshKey={0} />
              </div>
            )}
          </ErrorBoundary>
        </div>

        {/* Chat side panel */}
        {chatOpen && (
          <div
            className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[380px] sm:relative sm:top-auto sm:bottom-auto border-l flex flex-col"
            style={{
              background: 'var(--v2-bg-elevated)',
              borderColor: 'var(--v2-border)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--v2-border)' }}>
              <h3 className="text-sm font-semibold">Process Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg hover:opacity-80"
                style={{ color: 'var(--v2-text-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ProcessChat
                ref={chatRef}
                process={process}
                onProcessUpdate={handleProcessUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Flow Tab ── */
function FlowTabContent({
  process,
  viewMode,
  selectedOption,
  onSelectOption,
  containerRef,
}: {
  process: AnalysisResult;
  viewMode: 'flowchart' | 'swimlane';
  selectedOption: number;
  onSelectOption: (i: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  /* Build nodes/edges from selected data */
  const steps = selectedOption === 0
    ? process.currentState.steps
    : process.options[selectedOption - 1]?.steps ?? process.currentState.steps;
  const bottlenecks = selectedOption === 0 ? process.currentState.bottlenecks : [];

  // Build nodes/edges for FlowMap
  const { nodes, edges } = buildFlowData(steps, bottlenecks);

  return (
    <div className="flex flex-col h-full">
      {/* Option selector bar */}
      {process.options.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-b overflow-x-auto flex-shrink-0"
          style={{ borderColor: 'var(--v2-border)' }}
        >
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--v2-text-muted)' }}>
            Viewing:
          </span>
          <button
            onClick={() => onSelectOption(0)}
            className="px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
            style={{
              background: selectedOption === 0 ? 'var(--v2-primary-muted)' : 'transparent',
              borderColor: selectedOption === 0 ? 'var(--v2-primary)' : 'var(--v2-border)',
              color: selectedOption === 0 ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
            }}
          >
            Current State
          </button>
          {process.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onSelectOption(i + 1)}
              className="px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
              style={{
                background: selectedOption === i + 1 ? 'var(--v2-primary-muted)' : 'transparent',
                borderColor: selectedOption === i + 1 ? 'var(--v2-primary)' : 'var(--v2-border)',
                color: selectedOption === i + 1 ? 'var(--v2-primary-light)' : 'var(--v2-text-secondary)',
              }}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div ref={containerRef} id="v2-flow-container" className="flex-1 min-h-[400px]">
        {viewMode === 'swimlane' ? (
          <SwimLaneMap steps={steps} bottlenecks={bottlenecks} />
        ) : (
          <FlowMap initialNodes={nodes} initialEdges={edges} />
        )}
      </div>
    </div>
  );
}

/* ── Options Tab ── */
function OptionsTab({
  process,
  selectedOption,
  onSelect,
}: {
  process: AnalysisResult;
  selectedOption: number;
  onSelect: (i: number) => void;
}) {
  if (process.options.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--v2-text-muted)' }}>
        No optimization options available.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {process.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i + 1)}
          className="w-full text-left rounded-xl p-5 border transition-colors"
          style={{
            background: selectedOption === i + 1 ? 'var(--v2-primary-muted)' : 'var(--v2-bg-card)',
            borderColor: selectedOption === i + 1 ? 'var(--v2-primary)' : 'var(--v2-border)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">{opt.name}</h3>
              <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                {opt.description}
              </p>
            </div>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--v2-success-muted)', color: 'var(--v2-success)' }}
            >
              {opt.improvement}
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--v2-text-muted)' }}>
            {opt.steps.length} steps
          </p>
        </button>
      ))}
    </div>
  );
}

/* ── Build Flow Data (matching legacy FlowMap) ── */
function buildFlowData(
  steps: AnalysisResult['currentState']['steps'],
  bottlenecks: AnalysisResult['currentState']['bottlenecks']
) {
  const bottleneckIds = new Set(bottlenecks.map((b) => b.stepId));

  const nodes = steps.map((step, i) => ({
    id: step.id,
    type: 'processNode',
    position: { x: 250, y: i * 120 },
    data: {
      label: step.label,
      type: step.type,
      description: step.description,
      role: step.role,
      isBottleneck: bottleneckIds.has(step.id),
    },
  }));

  const edges = steps.flatMap((step) =>
    step.connections.map((targetId) => ({
      id: `${step.id}-${targetId}`,
      source: step.id,
      target: targetId,
      animated: bottleneckIds.has(step.id),
      style: { stroke: bottleneckIds.has(step.id) ? '#ef4444' : '#6366f1', strokeWidth: 2 },
    }))
  );

  return { nodes, edges };
}
