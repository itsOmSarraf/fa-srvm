import React, { useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type NodeMouseHandler,
} from '@xyflow/react';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { useFlowStore } from '@/stores/flowStore';
import { NodeCreationToolbar } from './NodeCreationToolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import '@xyflow/react/dist/style.css';

// Custom styles for bolder edges and larger handles
const edgeStyles = `
  .react-flow__edge-path {
    stroke-width: 2px;
    cursor: pointer;
  }
  
  .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 3px;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 3px;
  }

  /* Make input/output node handles match BaseNode handle size */
  .react-flow__node-input .react-flow__handle,
  .react-flow__node-output .react-flow__handle {
    width: 12px !important;
    height: 12px !important;
    border: 2px solid white !important;
  }
`;

export const Playground = () => {
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        onConnect,
        selectNode,
        selectedNodeId,
        addNode
    } = useFlowStore();

    // Use ReactFlow's internal state management for smoother interactions
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

    // Enable keyboard shortcuts for node creation
    useKeyboardShortcuts();

    // Sync Zustand state with ReactFlow state
    React.useEffect(() => {
        setFlowNodes(nodes);
    }, [nodes, setFlowNodes]);

    React.useEffect(() => {
        setFlowEdges(edges);
    }, [edges, setFlowEdges]);

    React.useEffect(() => {
        setNodes(flowNodes);
    }, [flowNodes, setNodes]);

    React.useEffect(() => {
        setEdges(flowEdges);
    }, [flowEdges, setEdges]);

    const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
        selectNode(node.id);
    }, [selectNode]);

    // Handle clicking on canvas background to deselect nodes
    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    // Handle drag and drop for creating new nodes
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const nodeType = event.dataTransfer.getData('application/reactflow');

        if (!nodeType) return;

        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };

        addNode(nodeType as any, position);
    }, [addNode]);

    // Add selection styling to nodes
    const nodesWithSelection = flowNodes.map(node => ({
        ...node,
        selected: node.id === selectedNodeId,
    }));

    return (
        <div className="w-full h-full">
            <style>{edgeStyles}</style>
            <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
                <ReactFlow
                    nodes={nodesWithSelection}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                    fitView
                    fitViewOptions={{
                        maxZoom: 0.7,
                        padding: 0.1
                    }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    multiSelectionKeyCode={['Meta', 'Ctrl']}
                    onPaneClick={onPaneClick}
                >
                    {/* <Controls /> */}
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    <NodeCreationToolbar />
                </ReactFlow>
            </div>
        </div>
    );
};