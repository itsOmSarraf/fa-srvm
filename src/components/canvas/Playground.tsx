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
import { useSmartNodePlacement } from '@/hooks/useSmartNodePlacement';

import '@xyflow/react/dist/style.css';

// Custom styles for bolder edges and larger handles
const edgeStyles = `
  .react-flow__edge-path {
    stroke-width: 2px;
    cursor: default;
    pointer-events: none;
  }
  
  .react-flow__edge.selected .react-flow__edge-path {
    stroke-width: 3px;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 3px;
  }

  /* Disable edge selection and clicking */
  .react-flow__edge {
    pointer-events: none;
  }

  /* Re-enable pointer events only for edge labels (delete buttons) */
  .react-flow__edge .react-flow__edge-labels {
    pointer-events: all;
  }

  /* Ensure delete button has proper cursor and higher z-index */
  .react-flow__edge button {
    cursor: pointer !important;
    position: relative;
    z-index: 20;
    pointer-events: all;
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
        selectedNodeId
    } = useFlowStore();

    // Use smart node placement hook
    const { addNodeSmart } = useSmartNodePlacement();

    // Use ReactFlow's internal state management for smoother interactions
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

    // Enable keyboard shortcuts for node creation
    useKeyboardShortcuts();

    // Sync Zustand state with ReactFlow state - ONE WAY ONLY to avoid circular updates
    React.useEffect(() => {
        setFlowNodes(nodes);
    }, [nodes, setFlowNodes]);

    React.useEffect(() => {
        setFlowEdges(edges);
    }, [edges, setFlowEdges]);

    // Only sync node changes that affect positioning/UI back to store
    React.useEffect(() => {
        // Don't sync back if we have fewer nodes (likely a deletion)
        if (flowNodes.length < nodes.length) {
            console.log('Skipping sync - node deletion detected');
            return;
        }

        // Only update store if there are actual position/UI changes
        const hasPositionChanges = flowNodes.some((flowNode, index) => {
            const storeNode = nodes[index];
            return storeNode && (
                flowNode.position.x !== storeNode.position.x ||
                flowNode.position.y !== storeNode.position.y
            );
        });

        if (hasPositionChanges && flowNodes.length === nodes.length) {
            // Only update positions, don't replace entire nodes array
            setNodes(flowNodes);
        }
    }, [flowNodes, nodes, setNodes]);

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

    // CRITICAL: Handle keyboard deletion manually to ensure it goes through the store
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Check if user is interacting with any input/textarea/contenteditable element
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            (activeElement as HTMLElement).contentEditable === 'true' ||
            activeElement.classList.contains('ProseMirror') || // For rich text editors
            activeElement.closest('[contenteditable="true"]') ||
            activeElement.closest('.transition-input') // Specific class for transition inputs
        );

        if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && !isInputFocused) {
            event.preventDefault();

            // Don't delete protected nodes
            if (selectedNodeId !== 'start' && selectedNodeId !== 'end') {
                // Use the store's deleteNode function to ensure persistence
                const { deleteNode } = useFlowStore.getState();
                deleteNode(selectedNodeId);
            }
        }
    }, [selectedNodeId]);

    // Add keyboard event listener for delete operations
    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle drag and drop for creating new nodes
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const nodeType = event.dataTransfer.getData('application/reactflow');

        if (!nodeType) return;

        // Use smart positioning instead of exact drop position
        addNodeSmart(nodeType as any);
    }, [addNodeSmart]);

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