import { Hash, Cog, Phone, Grid3X3, Square, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useFlowStore, NodeTypeKey } from "@/stores/flowStore"
import { useState } from "react"

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
    const addNode = useFlowStore((state) => state.addNode);
    const isSidebarCollapsed = useFlowStore((state) => state.isSidebarCollapsed);
    const setSidebarCollapsed = useFlowStore((state) => state.setSidebarCollapsed);

    const handleAddNode = (nodeType: NodeTypeKey) => {
        // Add node at a reasonable default position with some randomness
        const position = {
            x: Math.random() * 400 + 200,
            y: Math.random() * 300 + 150,
        };

        addNode(nodeType, position);
    };

    const handleDragStart = (event: React.DragEvent, nodeType: NodeTypeKey) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <SidebarProvider>
            <div className="relative">
                {isSidebarCollapsed ? (
                    /* Collapsed state - just a toggle button */
                    <div className="fixed left-0 top-20 z-20">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarCollapsed(false)}
                            className="h-8 w-8 p-0 bg-white border border-gray-200 shadow-lg hover:bg-gray-50 rounded-r-md rounded-l-none"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    /* Expanded state - full sidebar */
                    <Sidebar className="mt-20 w-64 transition-all duration-300">
                        {/* Collapse Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarCollapsed(true)}
                            className="absolute -right-3 top-4 z-10 h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>

                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-sm font-semibold text-gray-700 mb-3">
                                    {/* <Plus className="h-4 w-4 mr-2 inline" /> */}
                                    ADD NEW NODE
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <div
                                                key={item.title}
                                                className="group relative"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start p-3 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                                    onClick={() => handleAddNode(item.nodeType)}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item.nodeType)}
                                                >
                                                    <div className="flex items-start space-x-3 w-full">
                                                        <div
                                                            className="p-2 rounded-lg flex-shrink-0"
                                                            style={{ backgroundColor: `${item.color}20` }}
                                                        >
                                                            <item.icon
                                                                className="h-4 w-4"
                                                                style={{ color: item.color }}
                                                            />
                                                        </div>
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
                                                <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-xs text-blue-700 font-medium mb-1">
                                            💡 Pro Tip
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            Click to add at center or drag to position nodes precisely
                                        </div>
                                    </div>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                )}
            </div>
        </SidebarProvider>
    )
}