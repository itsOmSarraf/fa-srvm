import React from 'react';
import { type NodeProps } from '@xyflow/react';
import { Grid3X3 } from 'lucide-react';
import { NodeConfig } from '@/stores/flowStore';
import { BaseNode } from '../BaseNode';
import { nodeThemes } from './nodeThemes';

export const PressDigitNode: React.FC<NodeProps> = (props) => {
    const renderContent = (nodeData: NodeConfig) => (
        <>
            <div className="text-sm text-gray-600 mb-2">
                Max Digits: {nodeData.maxDigits || 1}
            </div>
            <div className="text-xs text-gray-500 mb-2">
                Delay: {nodeData.pauseDetectionDelay || 2000}ms
            </div>
        </>
    );

    return (
        <BaseNode
            {...props}
            icon={Grid3X3}
            colorTheme={nodeThemes.pressDigit}
            renderContent={renderContent}
        />
    );
}; 