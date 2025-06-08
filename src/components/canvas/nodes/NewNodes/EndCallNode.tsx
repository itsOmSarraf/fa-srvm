import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import { NodeConfig } from '@/stores/flowStore';
import { nodeThemes } from './nodeThemes';

export const EndCallNode: React.FC<NodeProps> = ({ data, id, selected }) => {
    const nodeData = data as NodeConfig;
    const theme = nodeThemes.endCall;

    return (
        <div className={`relative bg-white border-2 rounded-lg shadow-lg min-w-[200px] ${selected
            ? `${theme.borderSelected} ring-2 ${theme.ringSelected}`
            : theme.border
            }`}>
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    backgroundColor: theme.primary,
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                }}
            />

            {/* Header */}
            <div className={`flex items-center gap-2 p-3 ${theme.background} ${theme.border.replace('border-', 'border-b-')}`}>
                <Square className={`h-4 w-4 ${theme.text}`} />
                <span className={`font-medium ${theme.text} flex-1`}>{nodeData.label}</span>
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="text-sm text-gray-600 mb-2">
                    Reason: {nodeData.reason || 'Not specified'}
                </div>
                <div className="text-xs text-gray-500">
                    Final node
                </div>
            </div>
        </div>
    );
}; 