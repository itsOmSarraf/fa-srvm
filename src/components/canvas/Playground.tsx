import React from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
} from '@xyflow/react';
import { nodeTypes } from './nodes';
import { useNodeManagement } from './hooks/useNodeManagement';

import '@xyflow/react/dist/style.css';



const initialNodes = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1', outputCount: 1 },
        type: 'customNode'
    },
    {
        id: '2',
        position: { x: 0, y: 200 },
        data: { label: 'Node 2', outputCount: 2 },
        type: 'customNode'
    },
    {
        id: '3',
        position: { x: 400, y: 100 },
        data: { label: 'Node 3', outputCount: 1 },
        type: 'customNode'
    },
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        sourceHandle: 'output-0'
    },
    {
        id: 'e2-3-1',
        source: '2',
        target: '3',
        sourceHandle: 'output-0'
    },
    {
        id: 'e2-3-2',
        source: '2',
        target: '3',
        sourceHandle: 'output-1'
    },
];

export const Playground = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
    } = useNodeManagement(initialNodes, initialEdges);

    return (
        <div className="w-full">
            <div className="w-full h-[90%] overflow-y-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};