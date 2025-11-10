'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BlockType, WorkflowBlock, WorkflowConnection } from '@/lib/types';
import { BlockPalette } from './block-palette';
import { BlockConfigDialog } from './block-config-dialog';

interface WorkflowEditorProps {
  workflowId?: string;
  initialBlocks?: WorkflowBlock[];
  initialConnections?: WorkflowConnection[];
  onSave?: (blocks: WorkflowBlock[], connections: WorkflowConnection[]) => void;
  onExecute?: (workflowId: string) => void;
}

const blockTypes: BlockType[] = ['summarize', 'translate', 'generate_text', 'generate_image', 'extract', 'format'];

const getBlockColor = (type: BlockType) => {
  const colors: Record<BlockType, string> = {
    summarize: 'bg-blue-500',
    translate: 'bg-green-500',
    generate_text: 'bg-purple-500',
    generate_image: 'bg-pink-500',
    extract: 'bg-orange-500',
    format: 'bg-yellow-500',
  };
  return colors[type] || 'bg-gray-500';
};

const getBlockIcon = (type: BlockType) => {
  const icons: Record<BlockType, string> = {
    summarize: '📝',
    translate: '🌐',
    generate_text: '✨',
    generate_image: '🎨',
    extract: '🔍',
    format: '📋',
  };
  return icons[type] || '▢';
};

// Custom Block Node Component
const BlockNode = ({ data }: { data: any }) => {
  const { type, label, config } = data;
  const color = getBlockColor(type);
  const icon = getBlockIcon(type);

  return (
    <Card className="min-w-[200px] shadow-lg">
      <div className={`${color} text-white p-3 rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="font-semibold">{label}</div>
            <div className="text-xs opacity-90">{type}</div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-white rounded-b-lg">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500!" />
        <div className="text-sm text-gray-600 truncate">
          {config?.prompt ? config.prompt.substring(0, 30) + '...' : 'No prompt'}
        </div>
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500!" />
      </div>
    </Card>
  );
};

const nodeTypes: NodeTypes = {
  block: BlockNode,
};

export function WorkflowEditor({
  workflowId,
  initialBlocks = [],
  initialConnections = [],
  onSave,
  onExecute,
}: WorkflowEditorProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Convert workflow blocks to React Flow nodes
  const initialNodes: Node[] = useMemo(
    () =>
      initialBlocks.map((block) => ({
        id: block.id,
        type: 'block',
        position: block.position,
        data: {
          type: block.type,
          label: block.label,
          config: block.config,
        },
      })),
    [initialBlocks]
  );

  // Convert workflow connections to React Flow edges
  const initialEdges: Edge[] = useMemo(
    () =>
      initialConnections.map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        animated: true,
      })),
    [initialConnections]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setConfigDialogOpen(true);
  }, []);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setNodes((nds) => nds.filter((node) => !deleted.includes(node)));
    },
    [setNodes]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.includes(edge)));
    },
    [setEdges]
  );

  const handleAddBlock = useCallback(
    (type: BlockType, position: { x: number; y: number }) => {
      const newBlock: Node = {
        id: `block-${Date.now()}`,
        type: 'block',
        position,
        data: {
          type,
          label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
          config: {},
        },
      };
      setNodes((nds) => [...nds, newBlock]);
    },
    [setNodes]
  );

  const handleSave = useCallback(() => {
    const blocks: WorkflowBlock[] = nodes.map((node) => ({
      id: node.id,
      type: node.data.type as BlockType,
      label: node.data.label as string,
      position: node.position,
      config: (node.data.config || {}) as any,
    }));

    const connections: WorkflowConnection[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
    }));

    onSave?.(blocks, connections);
  }, [nodes, edges, onSave]);

  const handleUpdateBlockConfig = useCallback(
    (blockId: string, config: any, label?: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === blockId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config,
                  label: label || node.data.label,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  return (
    <div className="w-full h-screen flex">
      <BlockPalette onAddBlock={handleAddBlock} />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <div className="absolute top-4 right-20 z-10 flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            Save Workflow
          </Button>
          {workflowId && onExecute && (
            <Button onClick={() => onExecute(workflowId)}>
              Execute
            </Button>
          )}
        </div>
      </div>
      {selectedNode && (
        <BlockConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          node={selectedNode}
          onUpdate={handleUpdateBlockConfig}
        />
      )}
    </div>
  );
}

