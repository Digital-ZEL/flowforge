'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface NodeData {
  label: string;
  description?: string;
  isBottleneck?: boolean;
  bottleneckReason?: string;
  [key: string]: unknown;
}

const BaseHandle = () => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
  </>
);

export const StartNode = memo(function StartNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="px-5 py-3 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-800 font-semibold text-sm shadow-sm min-w-[160px] text-center dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-400">
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2 !h-2 !border-0" />
      {d.label}
    </div>
  );
});

export const ProcessNode = memo(function ProcessNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="px-5 py-3 rounded-lg bg-blue-50 border-2 border-blue-400 text-blue-900 text-sm shadow-sm min-w-[180px] dark:bg-blue-950 dark:text-blue-200 dark:border-blue-500">
      <BaseHandle />
      <div className="font-medium">{d.label}</div>
      {d.description && <div className="text-xs text-blue-600 mt-1 dark:text-blue-400">{d.description}</div>}
    </div>
  );
});

export const DecisionNode = memo(function DecisionNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 90 }}>
      <BaseHandle />
      <div
        className="absolute inset-0 bg-amber-50 border-2 border-amber-400 dark:bg-amber-950 dark:border-amber-500"
        style={{
          transform: 'rotate(45deg)',
          width: '70%',
          height: '70%',
          margin: 'auto',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: 4,
        }}
      />
      <div className="relative z-10 text-amber-900 text-xs font-medium text-center px-2 dark:text-amber-200">
        {d.label}
      </div>
    </div>
  );
});

export const HandoffNode = memo(function HandoffNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="px-5 py-3 rounded-lg bg-purple-50 border-2 border-purple-400 text-purple-900 text-sm shadow-sm min-w-[180px] dark:bg-purple-950 dark:text-purple-200 dark:border-purple-500">
      <BaseHandle />
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className="font-medium">{d.label}</span>
      </div>
      {d.description && <div className="text-xs text-purple-600 mt-1 dark:text-purple-400">{d.description}</div>}
    </div>
  );
});

export const BottleneckNode = memo(function BottleneckNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="px-5 py-3 rounded-lg bg-red-50 border-2 border-red-500 text-red-900 text-sm shadow-md min-w-[180px] ring-2 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-500 dark:ring-red-800">
      <BaseHandle />
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="font-medium">{d.label}</span>
      </div>
      {d.bottleneckReason && (
        <div className="text-xs text-red-600 mt-1 italic dark:text-red-400">⚠ {d.bottleneckReason}</div>
      )}
    </div>
  );
});

export const EndNode = memo(function EndNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="px-5 py-3 rounded-full bg-slate-100 border-2 border-slate-400 text-slate-700 font-semibold text-sm shadow-sm min-w-[160px] text-center dark:bg-slate-800 dark:text-slate-300 dark:border-slate-500">
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      {d.label}
    </div>
  );
});

export const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  handoff: HandoffNode,
  bottleneck: BottleneckNode,
  end: EndNode,
};
