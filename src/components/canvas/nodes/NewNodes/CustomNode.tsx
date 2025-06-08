import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

export interface CustomNodeData extends Record<string, unknown> {
    label: string;
    outputCount: number;
}

export const CustomNode = ({ data, id }: { data: CustomNodeData; id: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempLabel, setTempLabel] = useState(data.label);
    const [outputCount, setOutputCount] = useState(data.outputCount || 1);
    const updateNodeInternals = useUpdateNodeInternals();

    const handleSave = useCallback(() => {
        console.log('Saving new label:', tempLabel, 'for node:', id);
        data.label = tempLabel;
        setIsEditing(false);
    }, [tempLabel, data, id]);

    const handleCancel = useCallback(() => {
        setTempLabel(data.label);
        setIsEditing(false);
    }, [data.label]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    const addConnection = useCallback(() => {
        const newCount = outputCount + 1;
        setOutputCount(newCount);
        data.outputCount = newCount;
        console.log('Added connection, new count:', newCount);
        // Notify React Flow that node internals have changed
        updateNodeInternals(id);
    }, [outputCount, data, updateNodeInternals, id]);

    const removeConnection = useCallback(() => {
        if (outputCount > 1) {
            const newCount = outputCount - 1;
            setOutputCount(newCount);
            data.outputCount = newCount;
            console.log('Removed connection, new count:', newCount);
            // Notify React Flow that node internals have changed
            updateNodeInternals(id);
        }
    }, [outputCount, data, updateNodeInternals, id]);

    // Update local state when data changes externally
    useEffect(() => {
        setOutputCount(data.outputCount || 1);
        setTempLabel(data.label);
    }, [data.outputCount, data.label]);

    // Generate handles based on output count
    const renderOutputHandles = () => {
        const handles = [];
        for (let i = 0; i < outputCount; i++) {
            const totalHeight = outputCount * 30;
            const startTop = 50 - (totalHeight / 2) + 15; // Center the group and add offset for first handle
            const handleTop = startTop + (i * 30);

            handles.push(
                <Handle
                    key={`output-${i}`}
                    type="source"
                    position={Position.Right}
                    id={`output-${i}`}
                    style={{
                        top: `${handleTop}%`,
                        right: '-6px',
                        backgroundColor: '#555',
                        width: '12px',
                        height: '12px',
                        border: '2px solid white',
                        position: 'absolute',
                    }}
                />
            );
        }
        return handles;
    };

    return (
        <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg min-w-[180px]">
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    backgroundColor: '#555',
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                }}
            />

            {/* Header with edit functionality */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <Input
                            type="text"
                            value={tempLabel}
                            onChange={(e) => setTempLabel(e.target.value)}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            className="nodrag h-7 p-1 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
                        />
                    ) : (
                        <span
                            onDoubleClick={() => setIsEditing(true)}
                            className="block text-sm font-medium cursor-pointer truncate hover:text-blue-600"
                            title="Double-click to edit"
                        >
                            {data.label}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="nodrag h-6 w-6 p-0 hover:bg-gray-100"
                            title="Edit name"
                        >
                            ✏️
                        </Button>
                    )}

                    {isEditing && (
                        <>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSave}
                                className="nodrag h-6 w-6 p-0 bg-green-600 hover:bg-green-700 text-white"
                                title="Save"
                            >
                                ✓
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleCancel}
                                className="nodrag h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                                title="Cancel"
                            >
                                ✕
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Connection controls */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Outputs: {outputCount}</span>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addConnection}
                            className="nodrag h-6 w-6 p-0 hover:bg-green-50"
                            title="Add output"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                        {outputCount > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={removeConnection}
                                className="nodrag h-6 w-6 p-0 hover:bg-red-50"
                                title="Remove output"
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="text-xs text-gray-500">
                    ID: {id}
                </div>
            </div>

            {/* Output handles */}
            {renderOutputHandles()}
        </div>
    );
}; 