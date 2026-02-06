'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './ProcessNodes';
import type { ProcessStep, Bottleneck } from '@/lib/types';

interface SwimLaneMapProps {
  steps: ProcessStep[];
  bottlenecks?: Bottleneck[];
  className?: string;
}

const LANE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  Advisor: { bg: '#eef2ff', border: '#c7d2fe', label: '#4338ca' },
  Compliance: { bg: '#fef2f2', border: '#fecaca', label: '#991b1b' },
  Operations: { bg: '#f0fdf4', border: '#bbf7d0', label: '#166534' },
  Client: { bg: '#fffbeb', border: '#fde68a', label: '#92400e' },
  Partner: { bg: '#faf5ff', border: '#e9d5ff', label: '#6b21a8' },
  System: { bg: '#f0f9ff', border: '#bae6fd', label: '#075985' },
  Trading: { bg: '#fff7ed', border: '#fed7aa', label: '#9a3412' },
  Finance: { bg: '#ecfdf5', border: '#a7f3d0', label: '#065f46' },
  Analytics: { bg: '#fdf4ff', border: '#f5d0fe', label: '#86198f' },
  Management: { bg: '#f8fafc', border: '#cbd5e1', label: '#334155' },
};

const DEFAULT_LANE = { bg: '#f8fafc', border: '#e2e8f0', label: '#475569' };

function getRole(step: ProcessStep): string {
  // Check if the step has a role field (from chat-generated steps)
  const stepAny = step as ProcessStep & { role?: string };
  if (stepAny.role) return stepAny.role;

  // Auto-detect from label/description
  const text = `${step.label} ${step.description || ''}`.toLowerCase();

  if (text.includes('client') || text.includes('customer') || text.includes('investor'))
    return 'Client';
  if (text.includes('compliance') || text.includes('regulatory') || text.includes('audit'))
    return 'Compliance';
  if (text.includes('advisor') || text.includes('adviser') || text.includes('wealth'))
    return 'Advisor';
  if (text.includes('partner')) return 'Partner';
  if (text.includes('trading') || text.includes('trade') || text.includes('execution'))
    return 'Trading';
  if (text.includes('operations') || text.includes('ops') || text.includes('admin'))
    return 'Operations';
  if (text.includes('system') || text.includes('automat') || text.includes('portal') || text.includes('platform'))
    return 'System';
  if (text.includes('finance') || text.includes('billing') || text.includes('fee'))
    return 'Finance';
  if (text.includes('analytic') || text.includes('data') || text.includes('report'))
    return 'Analytics';
  if (text.includes('management') || text.includes('manager'))
    return 'Management';

  return 'Operations'; // default
}

export default function SwimLaneMap({
  steps,
  bottlenecks = [],
  className = '',
}: SwimLaneMapProps) {
  const { nodes, edges, laneLabels } = useMemo(() => {
    const bottleneckIds = new Set(bottlenecks.map((b) => b.stepId));

    // Group steps by role
    const roleGroups: Record<string, ProcessStep[]> = {};
    steps.forEach((step) => {
      const role = getRole(step);
      if (!roleGroups[role]) roleGroups[role] = [];
      roleGroups[role].push(step);
    });

    const roles = Object.keys(roleGroups);
    const LANE_HEIGHT = 150;
    const LANE_PADDING = 40;
    const NODE_WIDTH = 220;
    const NODE_GAP = 60;
    const LANE_HEADER_WIDTH = 120;

    // Calculate step order based on original array position
    const stepOrder = new Map<string, number>();
    steps.forEach((s, i) => stepOrder.set(s.id, i));

    const nodes: Node[] = [];
    const laneLabels: Array<{ role: string; y: number; color: typeof DEFAULT_LANE }> = [];

    roles.forEach((role, laneIdx) => {
      const laneY = laneIdx * (LANE_HEIGHT + LANE_PADDING);
      const color = LANE_COLORS[role] || DEFAULT_LANE;
      laneLabels.push({ role, y: laneY, color });

      // Sort steps in this lane by their original order
      const laneSteps = roleGroups[role].sort(
        (a, b) => (stepOrder.get(a.id) || 0) - (stepOrder.get(b.id) || 0)
      );

      // Add lane background node
      const laneWidth = Math.max(laneSteps.length * (NODE_WIDTH + NODE_GAP) + NODE_GAP, 600);
      nodes.push({
        id: `lane-${role}`,
        type: 'group',
        position: { x: LANE_HEADER_WIDTH, y: laneY },
        data: { label: '' },
        style: {
          width: laneWidth,
          height: LANE_HEIGHT,
          backgroundColor: color.bg,
          border: `2px solid ${color.border}`,
          borderRadius: 12,
          zIndex: -1,
        },
        selectable: false,
        draggable: false,
      });

      // Add lane label node
      nodes.push({
        id: `lane-label-${role}`,
        type: 'default',
        position: { x: 0, y: laneY + LANE_HEIGHT / 2 - 18 },
        data: { label: role },
        style: {
          width: LANE_HEADER_WIDTH - 10,
          fontSize: '12px',
          fontWeight: 700,
          color: color.label,
          background: 'transparent',
          border: 'none',
          textAlign: 'center' as const,
          boxShadow: 'none',
          padding: '4px',
        },
        selectable: false,
        draggable: false,
      });

      // Add step nodes within the lane
      laneSteps.forEach((step, stepIdx) => {
        const isBottleneck = bottleneckIds.has(step.id);
        const bottleneckInfo = bottlenecks.find((b) => b.stepId === step.id);

        let nodeType = step.type;
        if (isBottleneck && step.type !== 'start' && step.type !== 'end') {
          nodeType = 'bottleneck';
        }

        nodes.push({
          id: step.id,
          type: nodeType,
          position: {
            x: LANE_HEADER_WIDTH + NODE_GAP + stepIdx * (NODE_WIDTH + NODE_GAP),
            y: laneY + (LANE_HEIGHT - 60) / 2,
          },
          data: {
            label: step.label,
            description: step.description || '',
            isBottleneck,
            bottleneckReason: bottleneckInfo?.reason || '',
          },
        });
      });
    });

    // Create edges
    const edges: Edge[] = [];
    steps.forEach((step) => {
      step.connections.forEach((targetId) => {
        const sourceRole = getRole(step);
        const targetStep = steps.find((s) => s.id === targetId);
        const targetRole = targetStep ? getRole(targetStep) : sourceRole;
        const isCrossLane = sourceRole !== targetRole;

        edges.push({
          id: `e-${step.id}-${targetId}`,
          source: step.id,
          target: targetId,
          animated: true,
          style: {
            stroke: isCrossLane ? '#8b5cf6' : bottleneckIds.has(targetId) ? '#ef4444' : '#6366f1',
            strokeWidth: isCrossLane ? 3 : 2,
            strokeDasharray: isCrossLane ? '8 4' : undefined,
          },
          label: isCrossLane ? '↗ handoff' : undefined,
          labelStyle: { fontSize: 10, fill: '#8b5cf6', fontWeight: 600 },
          type: 'smoothstep',
        });
      });
    });

    return { nodes, edges, laneLabels };
  }, [steps, bottlenecks]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={true}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
