import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Hash, Cog, Phone, Grid3X3, Square, Plus, GripVertical, Maximize2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useFlowStore, NodeTypeKey } from '@/stores/flowStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartNodePlacement } from '@/hooks/useSmartNodePlacement';

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
    const { isSidebarCollapsed, selectedNodeId } = useFlowStore();
    const { addNodeSmart } = useSmartNodePlacement();
    const { fitView } = useReactFlow();
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Track both X and Y now
    const [isDragging, setIsDragging] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [keyboardHintVisible, setKeyboardHintVisible] = useState(false);
    const [isInitialShow, setIsInitialShow] = useState(true); // Track if this is the first time showing
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number }>({
        startX: 0, startY: 0, startPosX: 0, startPosY: 0
    });

    // Calculate visible bounds based on sidebar states
    const getVisibleBounds = useCallback(() => {
        const leftMargin = isSidebarCollapsed ? 20 : 276; // 256px + 20px padding
        const rightMargin = selectedNodeId ? 340 : 20; // 320px + 20px padding
        const toolbarWidth = 280; // Approximate width of toolbar
        const bottomPosition = window.innerHeight - 180; // Bring it higher up - 120px from bottom
        const maxUpward = window.innerHeight - 280; // Allow more upward movement

        return {
            left: leftMargin,
            right: window.innerWidth - rightMargin - toolbarWidth,
            center: (leftMargin + (window.innerWidth - rightMargin - toolbarWidth)) / 2,
            bottom: bottomPosition,
            maxTop: maxUpward
        };
    }, [isSidebarCollapsed, selectedNodeId]);

    // Auto-adjust position to stay in visible area
    const adjustPositionToVisibleArea = useCallback(() => {
        const bounds = getVisibleBounds();

        setPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;

            // Handle X position
            if (newX === 0 || newX < bounds.left || newX > bounds.right) {
                newX = Math.max(bounds.left, Math.min(bounds.center, bounds.right));
            } else {
                newX = Math.max(bounds.left, Math.min(newX, bounds.right));
            }

            // Handle Y position - default to bottom, but allow upward movement
            if (newY === 0) {
                newY = bounds.bottom;
            } else {
                // Constrain Y to only go upward from bottom
                newY = Math.max(bounds.maxTop, Math.min(newY, bounds.bottom));
            }

            return { x: newX, y: newY };
        });
    }, [getVisibleBounds]);

    // Show toolbar when left sidebar is collapsed
    useEffect(() => {
        if (isSidebarCollapsed) {
            setShowToolbar(true);
            setIsInitialShow(true);
            adjustPositionToVisibleArea();
        } else {
            setShowToolbar(false);
        }
    }, [isSidebarCollapsed, adjustPositionToVisibleArea]);

    // Adjust position when sidebar states change (but not initial show)
    useEffect(() => {
        if (showToolbar && !isInitialShow) {
            adjustPositionToVisibleArea();
        }
    }, [selectedNodeId, showToolbar, isInitialShow, adjustPositionToVisibleArea]);

    // Listen for keyboard shortcuts to temporarily show toolbar
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.key === 'Delete' ||
                event.key === 'Backspace'
            ) {
                return;
            }

            const keyToNodeType: Record<string, NodeTypeKey> = {
                c: 'conversation',
                f: 'function',
                t: 'callTransfer',
                d: 'pressDigit',
                e: 'endCall'
            };

            if (keyToNodeType[event.key.toLowerCase()]) {
                setKeyboardHintVisible(true);
                setTimeout(() => setKeyboardHintVisible(false), 2000);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleQuickAdd = useCallback((nodeType: NodeTypeKey) => {
        addNodeSmart(nodeType);
    }, [addNodeSmart]);

    const handleFitView = useCallback(() => {
        fitView({
            maxZoom: 0.7,
            padding: 0.1,
            duration: 500
        });
    }, [fitView]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        const newX = dragRef.current.startPosX + deltaX;
        const newY = dragRef.current.startPosY + deltaY;

        // Constrain to bounds
        const bounds = getVisibleBounds();
        setPosition({
            x: Math.max(bounds.left, Math.min(newX, bounds.right)),
            y: Math.max(bounds.maxTop, Math.min(newY, bounds.bottom)) // Only allow upward movement
        });
    }, [isDragging, getVisibleBounds]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Handle window resize to adjust position
    useEffect(() => {
        const handleResize = () => {
            if (showToolbar) {
                adjustPositionToVisibleArea();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showToolbar, adjustPositionToVisibleArea]);

    // Calculate initial animation position (from left sidebar)
    const getInitialPosition = () => {
        if (isInitialShow) {
            return { x: -300, y: position.y }; // Start from left sidebar position
        }
        return { x: position.x, y: position.y };
    };

    return (
        <>
            {/* Main Toolbar */}
            <AnimatePresence>
                {showToolbar && (
                    <motion.div
                        initial={getInitialPosition()}
                        animate={{ x: position.x, y: position.y }}
                        exit={{ x: -300, y: position.y }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onAnimationComplete={() => setIsInitialShow(false)}
                        className="fixed z-50"
                        style={{
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        data-tour="node-toolbar"
                    >
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 p-2 flex items-center gap-1">
                            <motion.div
                                className="flex items-center cursor-grab active:cursor-grabbing px-2 py-1 rounded-lg transition-colors"
                                onMouseDown={handleMouseDown}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <GripVertical className="h-3 w-3 text-gray-400" />
                                {/* <span className="text-xs font-medium text-gray-600 ml-1 hidden sm:block">Quick Add</span> */}
                            </motion.div>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            {nodeTypes.map((nodeType, index) => (
                                <motion.div
                                    key={nodeType.type}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03, type: "spring", stiffness: 500, damping: 30 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuickAdd(nodeType.type)}
                                        className="h-8 w-8 p-0 hover:bg-gray-100/80 relative group transition-all duration-200 hover:scale-110 rounded-lg"
                                        title={`${nodeType.label} (${nodeType.shortcut})`}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/reactflow', nodeType.type);
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                    >
                                        <nodeType.icon
                                            className="h-4 w-4 transition-transform group-hover:scale-110"
                                            style={{ color: nodeType.color }}
                                        />

                                        {/* Primary tooltip - Shortcut key */}
                                        <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            {nodeType.shortcut}
                                        </span>

                                        {/* Secondary tooltip - Node name */}
                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {nodeType.label}
                                        </span>
                                    </Button>
                                </motion.div>
                            ))}

                            {/* Separator */}
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            {/* Fit View Control */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: nodeTypes.length * 0.03, type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleFitView}
                                    className="h-8 w-8 p-0 hover:bg-gray-100/80 relative group transition-all duration-200 hover:scale-110 rounded-lg"
                                    title="Center and fit view"
                                >
                                    <Maximize2 className="h-4 w-4 text-gray-600 transition-transform group-hover:scale-110" />

                                    {/* Tooltip */}
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        Fit View
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcut Hint */}
            <AnimatePresence>
                {keyboardHintVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border border-gray-700 min-w-max">
                            <div className="text-sm font-medium whitespace-nowrap">Keyboard Shortcuts Active</div>
                            <div className="text-xs opacity-75 mt-1 whitespace-nowrap">
                                Press <kbd className="bg-gray-700 px-1 rounded text-white">C</kbd>, <kbd className="bg-gray-700 px-1 rounded text-white">F</kbd>, <kbd className="bg-gray-700 px-1 rounded text-white">T</kbd>, <kbd className="bg-gray-700 px-1 rounded text-white">D</kbd>, or <kbd className="bg-gray-700 px-1 rounded text-white">E</kbd> to add nodes quickly
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
