'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveProcess } from '@/lib/versionDb';
import { addAuditEntry, getAuditLog, type AuditEntry } from '@/lib/audit';
import type { AnalysisResult } from '@/lib/types';

type WorkflowStatus = 'draft' | 'in_review' | 'approved' | 'needs_update';

const STATUS_STEPS: { key: WorkflowStatus; label: string; icon: string }[] = [
  { key: 'draft', label: 'Draft', icon: '📝' },
  { key: 'in_review', label: 'In Review', icon: '👁️' },
  { key: 'approved', label: 'Approved', icon: '✅' },
];

const STATUS_BADGE: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Draft' },
  in_review: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'In Review' },
  approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Approved' },
  needs_update: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Needs Update' },
};

interface ApprovalWorkflowProps {
  process: AnalysisResult;
  onProcessUpdate: (updated: AnalysisResult) => void;
  onAuditChange?: () => void;
}

export default function ApprovalWorkflow({ process, onProcessUpdate, onAuditChange }: ApprovalWorkflowProps) {
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<AuditEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const status: WorkflowStatus = process.status || 'draft';

  const loadHistory = useCallback(async () => {
    try {
      const log = await getAuditLog(process.id);
      const approvalActions = log.filter((e) =>
        ['submitted_for_review', 'approved', 'rejected', 'requested_changes', 'status_changed'].includes(e.action)
      );
      setApprovalHistory(approvalActions);
    } catch (err) {
      console.error('Failed to load approval history:', err);
    }
  }, [process.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, process.status]);

  const changeStatus = async (newStatus: WorkflowStatus, action: string, description: string) => {
    setSaving(true);
    try {
      const updated: AnalysisResult = {
        ...process,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'approved' || newStatus === 'in_review'
          ? { lastReviewedAt: new Date().toISOString() }
          : {}),
      };
      await saveProcess(updated);
      await addAuditEntry(
        process.id,
        action as 'submitted_for_review' | 'approved' | 'rejected' | 'requested_changes' | 'status_changed',
        description + (comment ? ` — "${comment}"` : '')
      );
      setComment('');
      onProcessUpdate(updated);
      onAuditChange?.();
      await loadHistory();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = () =>
    changeStatus('in_review', 'submitted_for_review', 'Process submitted for review');

  const handleApprove = () =>
    changeStatus('approved', 'approved', 'Process approved');

  const handleRequestChanges = () => {
    if (!comment.trim()) return;
    changeStatus('needs_update', 'requested_changes', 'Changes requested');
  };

  const handleBackToDraft = () =>
    changeStatus('draft', 'status_changed', 'Status reverted to draft');

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const effectiveIndex = status === 'needs_update' ? 0 : currentStepIndex;

  const badge = STATUS_BADGE[status];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Approval Workflow
        </h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => {
          const isComplete = i < effectiveIndex;
          const isCurrent = i === effectiveIndex;
          const isNeedsUpdate = status === 'needs_update' && i === 0;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                    isComplete
                      ? 'bg-brand-600 text-white'
                      : isCurrent
                        ? isNeedsUpdate
                          ? 'bg-orange-500 text-white ring-2 ring-orange-200 dark:ring-orange-800'
                          : 'bg-brand-600 text-white ring-2 ring-brand-200 dark:ring-brand-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isCurrent || isComplete
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {isNeedsUpdate ? 'Needs Update' : step.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-16px] ${
                  i < effectiveIndex ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Comment field */}
      {(status === 'in_review' || status === 'needs_update' || status === 'draft') && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            status === 'in_review'
              ? 'Add a comment (required for requesting changes)...'
              : 'Add a comment (optional)...'
          }
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {status === 'draft' && (
          <button
            onClick={handleSubmitForReview}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            📤 Submit for Review
          </button>
        )}

        {status === 'in_review' && (
          <>
            <button
              onClick={handleApprove}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              ✅ Approve
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={saving || !comment.trim()}
              title={!comment.trim() ? 'Please add a comment explaining the changes needed' : ''}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              🔄 Request Changes
            </button>
          </>
        )}

        {status === 'needs_update' && (
          <button
            onClick={handleSubmitForReview}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            📤 Re-submit for Review
          </button>
        )}

        {status === 'approved' && (
          <button
            onClick={handleBackToDraft}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            ↩️ Revert to Draft
          </button>
        )}
      </div>

      {/* Approval history toggle */}
      {approvalHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            {showHistory ? 'Hide' : 'Show'} approval history ({approvalHistory.length})
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {approvalHistory.map((entry) => {
                const date = new Date(entry.timestamp);
                return (
                  <div key={entry.id} className="flex gap-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {entry.description}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
