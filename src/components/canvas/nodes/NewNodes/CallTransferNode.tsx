import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Phone } from 'lucide-react';
import { NodeConfig } from '@/stores/flowStore';
import { BaseNode } from '../BaseNode';
import { nodeThemes } from './nodeThemes';

export const CallTransferNode: React.FC<NodeProps> = (props) => {
    const renderContent = (nodeData: NodeConfig) => (
        <>
            <div className="text-sm text-gray-600 mb-2">
                Number: {nodeData.transferNumber || 'Not set'}
            </div>
            <div className="text-xs text-gray-500 mb-2">
                Type: {nodeData.transferType || 'warm'}
            </div>
        </>
    );

    return (
        <BaseNode
            {...props}
            icon={Phone}
            colorTheme={nodeThemes.callTransfer}
            renderContent={renderContent}
        />
    );
}; 