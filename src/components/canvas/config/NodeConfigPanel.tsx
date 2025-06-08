import React from 'react';
import { useFlowStore, NodeConfig, Transition } from '@/stores/flowStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Settings, ArrowRight } from 'lucide-react';

export const NodeConfigPanel: React.FC = () => {
    const {
        nodes,
        selectedNodeId,
        updateNode,
        deleteNode,
        addTransition,
        removeTransition,
        updateTransition
    } = useFlowStore();

    const selectedNode = nodes.find(node => node.id === selectedNodeId);

    if (!selectedNode || !selectedNodeId) {
        return (
            <div className="p-4 text-center text-gray-500">
                Select a node to configure its settings
            </div>
        );
    }

    const handleUpdate = (field: keyof NodeConfig, value: any) => {
        updateNode(selectedNodeId, { [field]: value });
    };

    const handleDelete = () => {
        if (selectedNode.id !== 'start' && selectedNode.id !== 'end') {
            deleteNode(selectedNodeId);
        }
    };

    const handleAddTransition = () => {
        addTransition(selectedNodeId);
    };

    const handleRemoveTransition = (transitionId: string) => {
        removeTransition(selectedNodeId, transitionId);
    };

    const handleUpdateTransition = (transitionId: string, updates: Partial<Transition>) => {
        updateTransition(selectedNodeId, transitionId, updates);
    };

    const renderTransitionSection = () => {
        if (selectedNode.data.type === 'endCall') {
            return null; // End call nodes don't have transitions
        }

        return (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Transition</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTransition}
                        className="h-8 px-3"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    {selectedNode.data.transitions?.map((transition, index) => (
                        <div key={transition.id} className="flex items-center gap-3 group">
                            <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                                <Input
                                    value={transition.label}
                                    onChange={(e) => handleUpdateTransition(transition.id, { label: e.target.value })}
                                    placeholder="Describe the transition condition"
                                    className="border-none bg-transparent text-gray-600 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTransition(transition.id)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                {selectedNode.data.transitions.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No transitions defined
                    </div>
                )}
            </div>
        );
    };

    const renderConfigFields = () => {
        const { data } = selectedNode;

        switch (data.type) {
            case 'conversation':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Conversation Prompt</Label>
                        <Textarea
                            id="prompt"
                            value={data.prompt || ''}
                            onChange={(e) => handleUpdate('prompt', e.target.value)}
                            placeholder="Enter the conversation prompt..."
                            rows={4}
                        />
                    </div>
                );

            case 'function':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="functionCode">Function Code</Label>
                        <Textarea
                            id="functionCode"
                            value={data.functionCode || ''}
                            onChange={(e) => handleUpdate('functionCode', e.target.value)}
                            placeholder="Enter your function code..."
                            rows={6}
                            className="font-mono text-sm"
                        />
                    </div>
                );

            case 'callTransfer':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="transferNumber">Transfer Number</Label>
                            <Input
                                id="transferNumber"
                                value={data.transferNumber || ''}
                                onChange={(e) => handleUpdate('transferNumber', e.target.value)}
                                placeholder="Enter phone number..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transferType">Transfer Type</Label>
                            <Select
                                value={data.transferType || 'warm'}
                                onValueChange={(value) => handleUpdate('transferType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="warm">Warm Transfer</SelectItem>
                                    <SelectItem value="cold">Cold Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                );

            case 'pressDigit':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="maxDigits">Maximum Digits</Label>
                            <Input
                                id="maxDigits"
                                type="number"
                                value={data.maxDigits || 1}
                                onChange={(e) => handleUpdate('maxDigits', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pauseDetectionDelay">Pause Detection Delay (ms)</Label>
                            <Input
                                id="pauseDetectionDelay"
                                type="number"
                                value={data.pauseDetectionDelay || 2000}
                                onChange={(e) => handleUpdate('pauseDetectionDelay', parseInt(e.target.value))}
                                min="500"
                                max="10000"
                                step="500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="terminationDigit">Termination Digit</Label>
                            <Input
                                id="terminationDigit"
                                value={data.terminationDigit || '#'}
                                onChange={(e) => handleUpdate('terminationDigit', e.target.value)}
                                maxLength={1}
                                placeholder="#"
                            />
                        </div>
                    </>
                );

            case 'endCall':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="reason">End Call Reason</Label>
                        <Input
                            id="reason"
                            value={data.reason || ''}
                            onChange={(e) => handleUpdate('reason', e.target.value)}
                            placeholder="Enter reason for ending call..."
                        />
                    </div>
                );

            default:
                return <div>No configuration available for this node type.</div>;
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-800"># {selectedNode.data.label}</span>
                </div>
                {selectedNode.id !== 'start' && selectedNode.id !== 'end' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="label">Node Label</Label>
                    <Input
                        id="label"
                        value={selectedNode.data.label}
                        onChange={(e) => handleUpdate('label', e.target.value)}
                        placeholder="Enter node label..."
                    />
                </div>

                {renderConfigFields()}
            </div>

            {/* Transition Section */}
            {renderTransitionSection()}

            {/* Debug Info */}
            <div className="pt-4 border-t">
                <div className="text-xs text-gray-500">
                    Node ID: {selectedNode.id} | Type: {selectedNode.data.type}
                </div>
            </div>
        </div>
    );
}; 