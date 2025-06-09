import React from 'react';
import {
    EdgeProps,
    getSmoothStepPath,
    EdgeLabelRenderer,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';

export const CustomEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
}) => {
    const { deleteEdge } = useFlowStore();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        deleteEdge(id);
    };

    return (
        <>
            <path
                id={id}
                className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
                d={edgePath}
                strokeWidth={2}
                stroke={selected ? '#ff6b6b' : '#b1b1b7'}
                fill="none"
                style={{
                    pointerEvents: 'none', // Disable clicking on the edge path
                    cursor: 'default'
                }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                        zIndex: 10,
                    }}
                    className="nodrag nopan"
                >
                    <div className="group relative">
                        {/* Larger invisible hover area to make interaction easier */}
                        <div
                            className="absolute inset-0 -m-6 rounded-full"
                            style={{ pointerEvents: 'all' }}
                        />
                        <button
                            onClick={handleDelete}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`
                                ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
                                transition-all duration-200 
                                bg-red-500 hover:bg-red-600 
                                text-white rounded-full 
                                w-6 h-6 
                                flex items-center justify-center 
                                shadow-lg border-2 border-white
                                hover:scale-110
                                focus:outline-none focus:ring-2 focus:ring-red-300
                                cursor-pointer
                                relative
                                z-20
                            `}
                            title="Delete edge"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}; 