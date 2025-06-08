import React, { useEffect } from 'react';
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { NodeConfig } from '@/stores/flowStore';
import { LucideIcon } from 'lucide-react';

interface ColorTheme {
    primary: string;
    background: string;
    border: string;
    borderSelected: string;
    ringSelected: string;
    text: string;
}

interface BaseNodeProps extends NodeProps {
    icon: LucideIcon;
    colorTheme: ColorTheme;
    renderContent: (nodeData: NodeConfig) => React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
    data,
    id,
    selected,
    icon: Icon,
    colorTheme,
    renderContent
}) => {
    const nodeData = data as NodeConfig;
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        updateNodeInternals(id);
    }, [nodeData.outputCount, updateNodeInternals, id]);

    const renderOutputHandles = () => {
        // Only render handles if there's potential for outputs (outputCount > 0)
        if (nodeData.outputCount <= 0) {
            return [];
        }

        const handles = [];

        // All handles aligned with transition labels at bottom (consistent positioning)
        for (let i = 0; i < nodeData.outputCount; i++) {
            // Calculate position based on transition label position
            // Outputs: label is first, then each transition follows
            // Base: pb-2 (8px) + "Outputs:" line + space-y-1 spacing between items
            const baseFromBottom = 8; // pb-2 padding
            const outputsLabelHeight = 16; // text-xs line height ~16px
            const spacingBetweenItems = 4; // space-y-1 = 4px
            const transitionLineHeight = 16; // text-xs line height

            // Reverse the index so first transition (i=0) aligns with topmost handle
            const reverseIndex = nodeData.outputCount - 1 - i;
            // Position: from bottom + padding + "Outputs:" label + spacing + (reverseIndex * (line height + spacing))
            const fromBottom = baseFromBottom + outputsLabelHeight + spacingBetweenItems + (reverseIndex * (transitionLineHeight + spacingBetweenItems));

            handles.push(
                <Handle
                    key={`output-${i}`}
                    type="source"
                    position={Position.Right}
                    id={`output-${i}`}
                    style={{
                        bottom: `${fromBottom}px`,
                        top: 'auto',
                        backgroundColor: colorTheme.primary,
                        width: '12px',
                        height: '12px',
                        border: '2px solid white',
                    }}
                />
            );
        }

        return handles;
    };

    const renderTransitionLabels = () => {
        return (
            <div className="px-3 pb-2 relative space-y-1">
                <div className="text-xs text-gray-500">Outputs:</div>
                {nodeData.outputCount > 0 && nodeData.transitions?.slice(0, nodeData.outputCount).map((transition, index) => (
                    <div key={transition.id} className="relative">
                        <span className="text-xs" style={{ color: colorTheme.primary }}>
                            {transition?.label || `Transition ${index + 1}`}
                        </span>
                    </div>
                ))}
                {nodeData.outputCount === 0 && (
                    <div className="text-xs text-gray-400 italic">
                        No outputs configured
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative bg-white border-2 rounded-lg shadow-lg min-w-[200px] ${selected
            ? `${colorTheme.borderSelected} ring-2 ${colorTheme.ringSelected}`
            : colorTheme.border
            }`}>
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    backgroundColor: colorTheme.primary,
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                }}
            />

            {/* Header */}
            <div className={`flex items-center gap-2 p-3 ${colorTheme.background} ${colorTheme.border.replace('border-', 'border-b-')}`}>
                <Icon className={`h-4 w-4 ${colorTheme.text}`} />
                <span className={`font-medium ${colorTheme.text} flex-1`}>{nodeData.label}</span>
            </div>

            {/* Content */}
            <div className="p-3">
                {renderContent(nodeData)}
            </div>

            {/* Transition Labels */}
            {renderTransitionLabels()}

            {/* Output handles */}
            {renderOutputHandles()}
        </div>
    );
}; 