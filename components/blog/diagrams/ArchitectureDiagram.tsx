'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeToolbar,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node component for Orleans components
function OrleansNode({ data }: { data: { label: string; sublabel?: string; description?: string } }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <NodeToolbar isVisible={showTooltip} position={Position.Top}>
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg max-w-[200px]">
          {data.description}
        </div>
      </NodeToolbar>
      <div
        className="rounded-xl bg-white border-2 border-blue-500 px-6 py-4 shadow-md hover:shadow-lg transition-shadow cursor-default"
        onMouseEnter={() => data.description && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
        <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
        <div className="text-center">
          <div className="font-semibold text-blue-700 text-sm">{data.label}</div>
          {data.sublabel && <div className="text-blue-600 text-xs mt-0.5">{data.sublabel}</div>}
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
        <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white" />
      </div>
    </>
  );
}

// Custom node for PostgreSQL components
function PostgresNode({ data }: { data: { label: string; sublabel?: string; description?: string } }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <NodeToolbar isVisible={showTooltip} position={Position.Top}>
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg max-w-[200px]">
          {data.description}
        </div>
      </NodeToolbar>
      <div
        className="rounded-xl bg-white border-2 border-cyan-500 px-6 py-4 shadow-md hover:shadow-lg transition-shadow cursor-default"
        onMouseEnter={() => data.description && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white" />
        <div className="text-center">
          <div className="font-semibold text-cyan-700 text-sm">{data.label}</div>
          {data.sublabel && <div className="text-cyan-600 text-xs mt-0.5">{data.sublabel}</div>}
        </div>
        <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white" />
        <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white" />
      </div>
    </>
  );
}

// Custom node for Client components
function ClientNode({ data }: { data: { label: string; sublabel?: string; description?: string } }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <NodeToolbar isVisible={showTooltip} position={Position.Top}>
        <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg max-w-[200px]">
          {data.description}
        </div>
      </NodeToolbar>
      <div
        className="rounded-xl bg-white border-2 border-purple-500 px-6 py-4 shadow-md hover:shadow-lg transition-shadow cursor-default"
        onMouseEnter={() => data.description && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white" />
        <div className="text-center">
          <div className="font-semibold text-purple-700 text-sm">{data.label}</div>
          {data.sublabel && <div className="text-purple-600 text-xs mt-0.5">{data.sublabel}</div>}
        </div>
        <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white" />
        <Handle type="source" position={Position.Top} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white" />
      </div>
    </>
  );
}

// Group/container node
function GroupNode({ data }: { data: { label: string; color: string } }) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-400 bg-blue-50/50',
    cyan: 'border-cyan-400 bg-cyan-50/50',
    purple: 'border-purple-400 bg-purple-50/50',
  };
  const textClasses: Record<string, string> = {
    blue: 'text-blue-600',
    cyan: 'text-cyan-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`rounded-2xl border-2 ${colorClasses[data.color]} p-4 h-full w-full`}>
      <div className={`font-bold text-sm ${textClasses[data.color]}`}>{data.label}</div>
    </div>
  );
}

// Dashed node for optional/external storage
function DashedNode({ data }: { data: { label: string; sublabel?: string } }) {
  return (
    <div className="rounded-xl bg-white border-2 border-dashed border-gray-400 px-6 py-4 shadow-sm">
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white" />
      <div className="text-center">
        <div className="font-medium text-gray-600 text-sm">{data.label}</div>
        {data.sublabel && <div className="text-gray-400 text-xs mt-0.5">{data.sublabel}</div>}
      </div>
    </div>
  );
}

const nodeTypes = {
  orleans: OrleansNode,
  postgres: PostgresNode,
  client: ClientNode,
  group: GroupNode,
  dashed: DashedNode,
};

const initialNodes: Node[] = [
  // Orleans Silo Group
  {
    id: 'orleans-group',
    type: 'group',
    position: { x: 0, y: 0 },
    data: { label: 'Orleans Silo', color: 'blue' },
    style: { width: 280, height: 280 },
  },
  {
    id: 'grain',
    type: 'orleans',
    position: { x: 70, y: 50 },
    data: {
      label: 'UserGrain',
      description: 'Your grain that holds state you want to search',
    },
    parentId: 'orleans-group',
    extent: 'parent',
  },
  {
    id: 'storage',
    type: 'orleans',
    position: { x: 40, y: 130 },
    data: {
      label: 'SearchableGrain',
      sublabel: 'Storage',
      description: 'Decorator that intercepts state writes and syncs to the index',
    },
    parentId: 'orleans-group',
    extent: 'parent',
  },
  {
    id: 'primary',
    type: 'dashed',
    position: { x: 40, y: 210 },
    data: {
      label: 'Primary Storage',
      sublabel: 'Redis, Azure, etc.',
    },
    parentId: 'orleans-group',
    extent: 'parent',
  },

  // PostgreSQL Group
  {
    id: 'postgres-group',
    type: 'group',
    position: { x: 380, y: 30 },
    data: { label: 'PostgreSQL', color: 'cyan' },
    style: { width: 280, height: 180 },
  },
  {
    id: 'index',
    type: 'postgres',
    position: { x: 30, y: 60 },
    data: {
      label: 'Search Index',
      description: 'EF Core managed table storing indexed grain properties',
    },
    parentId: 'postgres-group',
    extent: 'parent',
  },
  {
    id: 'fts',
    type: 'postgres',
    position: { x: 160, y: 60 },
    data: {
      label: 'Full-Text',
      sublabel: 'Search',
      description: 'PostgreSQL native full-text search capabilities',
    },
    parentId: 'postgres-group',
    extent: 'parent',
  },

  // Client Group
  {
    id: 'client-group',
    type: 'group',
    position: { x: 0, y: 320 },
    data: { label: 'Client', color: 'purple' },
    style: { width: 180, height: 120 },
  },
  {
    id: 'client',
    type: 'client',
    position: { x: 30, y: 50 },
    data: {
      label: 'Orleans Client',
      description: 'Your application code that queries for grains',
    },
    parentId: 'client-group',
    extent: 'parent',
  },

  // Query Provider (standalone)
  {
    id: 'provider',
    type: 'client',
    position: { x: 260, y: 370 },
    data: {
      label: 'Query Provider',
      description: 'Translates LINQ expressions to SQL queries',
    },
  },
];

const initialEdges: Edge[] = [
  // Write path
  {
    id: 'grain-storage',
    source: 'grain',
    target: 'storage',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'WriteStateAsync()',
    labelStyle: { fontSize: 10, fontFamily: 'ui-monospace', fill: '#3b82f6' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    animated: false,
  },
  {
    id: 'storage-primary',
    source: 'storage',
    target: 'primary',
    label: '1. Write',
    labelStyle: { fontSize: 9, fill: '#64748b' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
  },
  {
    id: 'storage-index',
    source: 'storage',
    target: 'index',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: '2. Sync index',
    labelStyle: { fontSize: 10, fill: '#0ea5e9' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#0ea5e9', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
  },
  {
    id: 'index-fts',
    source: 'index',
    target: 'fts',
    style: { stroke: '#0ea5e9', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
  },

  // Query path
  {
    id: 'client-provider',
    source: 'client',
    target: 'provider',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'Query',
    labelStyle: { fontSize: 10, fontWeight: 600, fill: '#8b5cf6' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  {
    id: 'provider-index',
    source: 'provider',
    target: 'index',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    label: 'LINQ → SQL',
    labelStyle: { fontSize: 10, fontFamily: 'ui-monospace', fill: '#8b5cf6' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  },
  {
    id: 'index-provider-return',
    source: 'index',
    target: 'provider',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'Grain keys',
    labelStyle: { fontSize: 9, fill: '#64748b' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6 3' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    animated: true,
  },
];

export function ArchitectureDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="my-8 h-[480px] w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        preventScrolling={false}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
