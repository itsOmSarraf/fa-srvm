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

import '@xyflow/react/dist/style.css';

// Custom styles for bolder edges
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

    // Use ReactFlow's internal state management for smoother interactions
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

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

    // Add selection styling to nodes
    const nodesWithSelection = flowNodes.map(node => ({
        ...node,
        selected: node.id === selectedNodeId,
    }));

    return (
        <div className="w-full">
            <style>{edgeStyles}</style>
            <div className="w-full h-[90%] overflow-y-hidden">
                <ReactFlow
                    nodes={nodesWithSelection}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    deleteKeyCode={['Backspace', 'Delete']}
                    multiSelectionKeyCode={['Meta', 'Ctrl']}
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};