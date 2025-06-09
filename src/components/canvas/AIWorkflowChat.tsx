'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useChat } from 'ai/react';
import { MessageCircle, X, Send, Loader2, Plus, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFlowStore } from '@/stores/flowStore';
import type { NodeTypeKey } from '@/stores/flowStore';
import { WorkflowActionHandler, type WorkflowAction } from './WorkflowActionHandler';

const PREDEFINED_PROMPTS = [
    "Add a customer service workflow that greets users and offers to transfer to sales or support",
    "Create a feedback collection system that asks for rating (1-5) and captures comments",
    "Build a main menu that lets users press 1 for billing, 2 for tech support, or 0 for operator"
];

export function AIWorkflowChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

    // Get current flow state from Zustand store with memoization
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const selectedNodeId = useFlowStore((state) => state.selectedNodeId);

    const flowState = useMemo(() => ({
        nodes,
        edges,
        selectedNodeId
    }), [nodes, edges, selectedNodeId]);

    const { _createNode, updateNode, onConnect, addTransition } = useFlowStore();

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    });

    // Custom submit handler that includes flow state
    const handleSubmitWithFlowState = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;

        handleSubmit(e, {
            body: {
                flowState: flowState
            }
        });
    }, [handleSubmit, input, flowState]);

    const handlePredefinedPrompt = useCallback((prompt: string) => {
        handleInputChange({ target: { value: prompt } } as any);
    }, [handleInputChange]);

    // Function to help users implement AI suggestions
    const handleCreateNode = useCallback((nodeType: NodeTypeKey, position: { x: number; y: number }) => {
        _createNode(nodeType, position);
    }, [_createNode]);

    const handleUpdateNode = useCallback((nodeId: string, updates: any) => {
        updateNode(nodeId, updates);
    }, [updateNode]);

    // Parse AI response for actions
    const parseAIResponse = useCallback((content: string) => {
        try {
            const humanExplanationMatch = content.match(/HUMAN_EXPLANATION:\s*([\s\S]*?)(?=ACTIONS:|$)/);
            const actionsMatch = content.match(/ACTIONS:\s*([\s\S]*?)$/);

            if (humanExplanationMatch && actionsMatch) {
                const explanation = humanExplanationMatch[1].trim();
                const actionsText = actionsMatch[1].trim();

                // Try to parse the JSON actions
                const actions = JSON.parse(actionsText) as WorkflowAction[];

                return { explanation, actions };
            }
        } catch (error) {
            console.warn('Failed to parse AI response for actions:', error);
        }
        return null;
    }, []);

    const handleApplyActions = useCallback((messageId: string) => {
        setAppliedActions(prev => {
            const newSet = new Set(prev);
            newSet.add(messageId);
            return newSet;
        });
    }, []);

    const handleRejectActions = useCallback((messageId: string) => {
        // For now, just mark as rejected (same as applied to hide the action buttons)
        setAppliedActions(prev => {
            const newSet = new Set(prev);
            newSet.add(messageId);
            return newSet;
        });
    }, []);

    return (
        <>
            {/* Floating Chat Icon */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 300, damping: 30 }}
                data-tour="ai-chat"
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="icon"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </Button>
            </motion.div>

            {/* Chat Dialog */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">AI Workflow Assistant</h3>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            {messages.length === 0 ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Hi! I can help you create and modify workflows. I can see your current workflow and suggest specific changes.
                                    </p>
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        Current workflow: {flowState.nodes.length} nodes, {flowState.edges.length} connections
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Try one of these prompts:
                                    </p>
                                    {PREDEFINED_PROMPTS.map((prompt, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handlePredefinedPrompt(prompt)}
                                            className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300"
                                        >
                                            {prompt}
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => {
                                        const parsedActions = message.role === 'assistant' ? parseAIResponse(message.content) : null;
                                        const hasAppliedActions = appliedActions.has(message.id);

                                        return (
                                            <div key={message.id}>
                                                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`max-w-[80%] p-3 rounded-lg text-sm ${message.role === 'user'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                            }`}
                                                    >
                                                        <div className="whitespace-pre-wrap">
                                                            {parsedActions ? (
                                                                // Show only the human explanation part
                                                                parsedActions.explanation
                                                            ) : (
                                                                message.content
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Show action handler if AI response has actions and not yet applied */}
                                                {parsedActions && !hasAppliedActions && (
                                                    <WorkflowActionHandler
                                                        actions={parsedActions.actions}
                                                        explanation={parsedActions.explanation}
                                                        onApply={() => handleApplyActions(message.id)}
                                                        onReject={() => handleRejectActions(message.id)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSubmitWithFlowState} className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask about creating workflows..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
} 