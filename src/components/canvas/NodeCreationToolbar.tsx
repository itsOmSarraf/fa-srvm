import React, { useState, useRef } from 'react';
import { Hash, Cog, Phone, Grid3X3, Square, Plus, GripVertical } from 'lucide-react';
import { useFlowStore, NodeTypeKey } from '@/stores/flowStore';
import { Button } from '@/components/ui/button';

const nodeTypes = [
    {
        type: 'conversation' as NodeTypeKey,
        icon: Hash,
        label: 'Conversation',
        color: '#8B5CF6',
        shortcut: 'C'
    },
    {
        type: 'function' as NodeTypeKey,
        icon: Cog,
        label: 'Function',
        color: '#3B82F6',
        shortcut: 'F'
    },
    {
        type: 'callTransfer' as NodeTypeKey,
        icon: Phone,
        label: 'Call Transfer',
        color: '#10B981',
        shortcut: 'T'
    },
    {
        type: 'pressDigit' as NodeTypeKey,
        icon: Grid3X3,
        label: 'Press Digit',
        color: '#F59E0B',
        shortcut: 'D'
    },
    {
        type: 'endCall' as NodeTypeKey,
        icon: Square,
        label: 'End Call',
        color: '#EF4444',
        shortcut: 'E'
    }
];

export const NodeCreationToolbar: React.FC = () => {
    const { addNode, isSidebarCollapsed } = useFlowStore();
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number }>({
        startX: 0, startY: 0, startPosX: 0, startPosY: 0
    });

    const handleQuickAdd = (nodeType: NodeTypeKey) => {
        // Add node at a reasonable default position with some randomness
        const nodePosition = {
            x: Math.random() * 400 + 200,
            y: Math.random() * 300 + 150,
        };

        addNode(nodeType, nodePosition);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        setPosition({
            x: dragRef.current.startPosX + deltaX,
            y: dragRef.current.startPosY + deltaY
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    // Only show when sidebar is collapsed
    if (!isSidebarCollapsed) {
        return null;
    }

    return (
        <div
            className="absolute z-10"
            style={{
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-1">
                <div
                    className="flex items-center gap-1 mr-2 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {/* <span className="text-sm font-medium text-gray-700">Quick Add:</span> */}
                </div>

                {nodeTypes.map((nodeType) => (
                    <Button
                        key={nodeType.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAdd(nodeType.type)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 relative group"
                        title={`${nodeType.label} (${nodeType.shortcut})`}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/reactflow', nodeType.type);
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <nodeType.icon
                            className="h-4 w-4"
                            style={{ color: nodeType.color }}
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {nodeType.shortcut}
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    );
};
