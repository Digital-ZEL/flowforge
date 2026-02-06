import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { ProcessStep, Bottleneck } from './types';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

export function getLayoutedElements(
  steps: ProcessStep[],
  bottlenecks: Bottleneck[] = []
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });

  const bottleneckIds = new Set(bottlenecks.map((b) => b.stepId));

  // Add nodes
  steps.forEach((step) => {
    dagreGraph.setNode(step.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges
  const edges: Edge[] = [];
  steps.forEach((step) => {
    step.connections.forEach((targetId) => {
      const edgeId = `e-${step.id}-${targetId}`;
      dagreGraph.setEdge(step.id, targetId);
      edges.push({
        id: edgeId,
        source: step.id,
        target: targetId,
        animated: true,
        style: { stroke: bottleneckIds.has(targetId) ? '#ef4444' : '#6366f1', strokeWidth: 2 },
      });
    });
  });

  dagre.layout(dagreGraph);

  const validTypes = new Set(['start', 'process', 'decision', 'handoff', 'bottleneck', 'end']);

  const nodes: Node[] = steps.map((step) => {
    const nodeWithPosition = dagreGraph.node(step.id);
    const isBottleneck = bottleneckIds.has(step.id);
    const bottleneckInfo = bottlenecks.find((b) => b.stepId === step.id);

    let nodeType = validTypes.has(step.type) ? step.type : 'process';
    if (isBottleneck && step.type !== 'start' && step.type !== 'end') {
      nodeType = 'bottleneck';
    }

    return {
      id: step.id,
      type: nodeType,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      data: {
        label: step.label,
        description: step.description || '',
        isBottleneck,
        bottleneckReason: bottleneckInfo?.reason || '',
      },
    };
  });

  return { nodes, edges };
}
