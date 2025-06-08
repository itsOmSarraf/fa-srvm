import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Cog } from 'lucide-react';
import { NodeConfig } from '@/stores/flowStore';
import { BaseNode } from '../BaseNode';
import { nodeThemes } from './nodeThemes';

export const FunctionNode: React.FC<NodeProps> = (props) => {
    const renderContent = (nodeData: NodeConfig) => (
        <>
            <div className="text-sm text-gray-600 mb-2">
                Function: {nodeData.functionCode ? 'Configured' : 'Not configured'}
            </div>
            <div className="text-xs text-gray-500 mb-2">
                Parameters: {Object.keys(nodeData.parameters || {}).length}
            </div>
        </>
    );

    return (
        <BaseNode
            {...props}
            icon={Cog}
            colorTheme={nodeThemes.function}
            renderContent={renderContent}
        />
    );
}; 