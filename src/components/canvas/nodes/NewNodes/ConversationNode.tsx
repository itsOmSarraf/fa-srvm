import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Hash } from 'lucide-react';
import { NodeConfig } from '@/stores/flowStore';
import { BaseNode } from '../BaseNode';
import { nodeThemes } from './nodeThemes';

export const ConversationNode: React.FC<NodeProps> = (props) => {
    const renderContent = (nodeData: NodeConfig) => (
        <div className="text-sm text-gray-600 mb-2">
            {nodeData.prompt?.substring(0, 50) || 'No prompt set'}...
        </div>
    );

    return (
        <BaseNode
            {...props}
            icon={Hash}
            colorTheme={nodeThemes.conversation}
            renderContent={renderContent}
        />
    );
}; 