'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFlowStore } from '@/stores/flowStore';
import type { NodeTypeKey } from '@/stores/flowStore';
import { Check, X, Undo2 } from 'lucide-react';

export interface WorkflowAction {
    type: 'CREATE_NODE' | 'UPDATE_NODE' | 'CREATE_CONNECTION' | 'ADD_TRANSITION';
    nodeType?: NodeTypeKey;
    position?: { x: number; y: number };
    config?: any;
    nodeId?: string;
    updates?: any;
    sourceId?: string;
    targetId?: string;
    label?: string;
    condition?: string;
}

interface WorkflowActionHandlerProps {
    actions: WorkflowAction[];
    explanation: string;
    onApply: () => void;
    onReject: () => void;
}

export function WorkflowActionHandler({
    actions,
    explanation,
    onApply,
    onReject
}: WorkflowActionHandlerProps) {
    const { _createNode, updateNode, onConnect, addTransition, undo, canUndo } = useFlowStore();

    const executeActions = async () => {
        const createdNodeIds: string[] = [];
        const createNodeActions = actions.filter(action => action.type === 'CREATE_NODE');

        // Create all nodes first and wait for them to be properly created
        for (let i = 0; i < createNodeActions.length; i++) {
            const action = createNodeActions[i];
            if (action.nodeType && action.position) {
                const beforeNodeCount = useFlowStore.getState().nodes.length;
                _createNode(action.nodeType, action.position);

                // Wait a bit and then get the node ID
                await new Promise(resolve => setTimeout(resolve, 100));

                const afterNodeCount = useFlowStore.getState().nodes.length;
                if (afterNodeCount > beforeNodeCount) {
                    const store = useFlowStore.getState();
                    const latestNode = store.nodes[afterNodeCount - 1];
                    createdNodeIds[i] = latestNode.id;

                    // Update node config if provided
                    if (action.config) {
                        updateNode(latestNode.id, action.config);
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
        }

        // Now handle all other actions
        for (const action of actions) {
            switch (action.type) {
                case 'UPDATE_NODE':
                    if (action.nodeId && action.updates) {
                        updateNode(action.nodeId, action.updates);
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    break;

                case 'CREATE_CONNECTION':
                    if (action.sourceId && action.targetId) {
                        let sourceId = action.sourceId;
                        let targetId = action.targetId;

                        // Replace LAST_CREATED_NODE_X references with actual node IDs
                        const sourceMatch = sourceId.match(/LAST_CREATED_NODE_(\d+)/);
                        if (sourceMatch) {
                            const nodeIndex = parseInt(sourceMatch[1]) - 1;
                            sourceId = createdNodeIds[nodeIndex] || sourceId;
                        }

                        const targetMatch = targetId.match(/LAST_CREATED_NODE_(\d+)/);
                        if (targetMatch) {
                            const nodeIndex = parseInt(targetMatch[1]) - 1;
                            targetId = createdNodeIds[nodeIndex] || targetId;
                        }

                        // Create the connection
                        if (sourceId && targetId && sourceId !== targetId) {
                            console.log(`Creating connection: ${sourceId} → ${targetId}`);
                            onConnect({
                                source: sourceId,
                                target: targetId,
                                sourceHandle: null,
                                targetHandle: null
                            });
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                    break;

                case 'ADD_TRANSITION':
                    if (action.nodeId) {
                        addTransition(action.nodeId);

                        // Update transition label/condition if provided
                        if (action.label || action.condition) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                            const store = useFlowStore.getState();
                            const node = store.nodes.find(n => n.id === action.nodeId);
                            if (node && node.data.transitions.length > 0) {
                                const lastTransition = node.data.transitions[node.data.transitions.length - 1];
                                updateNode(action.nodeId!, {
                                    transitions: node.data.transitions.map(t =>
                                        t.id === lastTransition.id
                                            ? { ...t, label: action.label || t.label, condition: action.condition || t.condition }
                                            : t
                                    )
                                });
                            }
                        }
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    break;
            }
        }

        onApply();
    };

    const handleUndo = () => {
        undo();
    };

    return (
        <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg my-3">
            <div className="mb-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    AI Workflow Suggestion
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    {explanation}
                </p>
            </div>

            <div className="mb-3">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Actions to be performed:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    {actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            {action.type === 'CREATE_NODE' && (
                                <span>Create {action.nodeType} node at ({action.position?.x}, {action.position?.y})</span>
                            )}
                            {action.type === 'UPDATE_NODE' && (
                                <span>Update node {action.nodeId}</span>
                            )}
                            {action.type === 'CREATE_CONNECTION' && (
                                <span>Connect {action.sourceId} → {action.targetId}</span>
                            )}
                            {action.type === 'ADD_TRANSITION' && (
                                <span>Add transition &quot;{action.label}&quot; to {action.nodeId}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={executeActions}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Check className="w-3 h-3 mr-1" />
                    Apply Changes
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                </Button>
                {canUndo && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUndo}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Undo Last
                    </Button>
                )}
            </div>
        </div>
    );
} 