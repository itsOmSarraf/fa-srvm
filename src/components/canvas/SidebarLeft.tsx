import { Hash, Cog, Phone, Grid3X3, Square, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useFlowStore, NodeTypeKey } from "@/stores/flowStore"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSmartNodePlacement } from "@/hooks/useSmartNodePlacement"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Menu items with corresponding node types
const items: Array<{
    title: string;
    nodeType: NodeTypeKey;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
}> = [
        {
            title: "Conversation",
            nodeType: "conversation",
            icon: Hash,
            color: "#8B5CF6", // Purple
            description: "Handle voice interactions and responses"
        },
        {
            title: "Function",
            nodeType: "function",
            icon: Cog,
            color: "#3B82F6", // Blue
            description: "Execute custom code or API calls"
        },
        {
            title: "Call Transfer",
            nodeType: "callTransfer",
            icon: Phone,
            color: "#10B981", // Green
            description: "Transfer call to another number"
        },
        {
            title: "Press Digit",
            nodeType: "pressDigit",
            icon: Grid3X3,
            color: "#F59E0B", // Orange
            description: "Handle keypad input from caller"
        },
        {
            title: "End Call",
            nodeType: "endCall",
            icon: Square,
            color: "#EF4444", // Red
            description: "Terminate the call"
        },
    ]

export function SidebarLeft() {
    const isSidebarCollapsed = useFlowStore((state) => state.isSidebarCollapsed);
    const setSidebarCollapsed = useFlowStore((state) => state.setSidebarCollapsed);
    const { addNodeSmart } = useSmartNodePlacement();

    const handleAddNode = (nodeType: NodeTypeKey) => {
        addNodeSmart(nodeType);
    };

    const handleDragStart = (event: React.DragEvent, nodeType: NodeTypeKey) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {isSidebarCollapsed ? (
                    /* Collapsed state - just a toggle button */
                    <motion.div
                        key="collapsed"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed left-0 top-20 z-20"
                        data-tour="sidebar-left-toggle"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarCollapsed(false)}
                            className="h-10 w-10 p-0 bg-white border border-gray-200 shadow-lg hover:bg-gray-50 rounded-r-lg rounded-l-none transition-all duration-200 hover:shadow-xl hover:scale-105"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ) : (
                    /* Expanded state - full sidebar */
                    <motion.div
                        key="expanded"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="fixed left-0 top-0 z-30 h-full"
                    >
                        <SidebarProvider>
                            <Sidebar className="mt-20 w-64 h-full border-r border-gray-200 shadow-lg bg-white" data-tour="sidebar-left">
                                {/* Collapse Button */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSidebarCollapsed(true)}
                                        className="absolute -right-3 top-4 z-10 h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                </motion.div>

                                <SidebarContent>
                                    <SidebarGroup>
                                        <motion.div
                                            initial={{ x: -30, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1, duration: 0.4 }}
                                        >
                                            <SidebarGroupLabel className="text-sm font-semibold text-gray-700 mb-3">
                                                ADD NEW NODE
                                            </SidebarGroupLabel>
                                        </motion.div>
                                        <SidebarGroupContent>
                                            <div className="space-y-2">
                                                {items.map((item, index) => (
                                                    <motion.div
                                                        key={item.title}
                                                        initial={{ x: -50, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{
                                                            delay: 0.15 + (index * 0.08),
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 25
                                                        }}
                                                        className="group relative"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start p-3 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                                                            onClick={() => handleAddNode(item.nodeType)}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, item.nodeType)}
                                                        >
                                                            <div className="flex items-start space-x-3 w-full">
                                                                <motion.div
                                                                    className="p-2 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                                                    style={{ backgroundColor: `${item.color}20` }}
                                                                    whileHover={{ scale: 1.1 }}
                                                                >
                                                                    <item.icon
                                                                        className="h-4 w-4"
                                                                        style={{ color: item.color }}
                                                                    />
                                                                </motion.div>
                                                                <div className="flex-1 min-w-0 text-left">
                                                                    <div className="font-medium text-gray-900 text-sm">
                                                                        {item.title}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1 leading-tight break-words text-wrap">
                                                                        {item.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Button>

                                                        {/* Drag indicator */}
                                                        <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-200" />
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <motion.div
                                                initial={{ x: -30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                                className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                            >
                                                <div className="text-xs text-blue-700 font-medium mb-1">
                                                    💡 Pro Tip
                                                </div>
                                                <div className="text-xs text-blue-600">
                                                    Click to add at center or drag to position nodes precisely
                                                </div>
                                            </motion.div>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                </SidebarContent>
                            </Sidebar>
                        </SidebarProvider>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}