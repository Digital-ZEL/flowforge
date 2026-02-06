'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './ProcessNodes';

interface FlowMapProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  className?: string;
  interactive?: boolean;
}

export default function FlowMap({
  initialNodes,
  initialEdges,
  className = '',
  interactive = true,
}: FlowMapProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const flowRef = useRef<HTMLDivElement>(null);

  const onInit = useCallback(() => {
    // flow is ready
  }, []);

  return (
    <div ref={flowRef} className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          className="!bg-slate-100 dark:!bg-slate-800"
          maskColor="rgba(100, 116, 139, 0.2)"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
