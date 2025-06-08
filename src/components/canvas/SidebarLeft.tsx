import { Hash, Cog, Phone, Grid3X3, Square } from "lucide-react"
import { useFlowStore, NodeTypeKey } from "@/stores/flowStore"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

// Menu items with corresponding node types
const items: Array<{
    title: string;
    nodeType: NodeTypeKey;
    icon: React.ComponentType<any>;
    color: string;
}> = [
        {
            title: "Conversation",
            nodeType: "conversation",
            icon: Hash,
            color: "#8B5CF6", // Purple
        },
        {
            title: "Function",
            nodeType: "function",
            icon: Cog,
            color: "#3B82F6", // Blue
        },
        {
            title: "Call Transfer",
            nodeType: "callTransfer",
            icon: Phone,
            color: "#10B981", // Green
        },
        {
            title: "Press Digit",
            nodeType: "pressDigit",
            icon: Grid3X3,
            color: "#F59E0B", // Orange
        },
        {
            title: "Ending",
            nodeType: "endCall",
            icon: Square,
            color: "#EF4444", // Red
        },
    ]

export function SidebarLeft() {
    const addNode = useFlowStore((state) => state.addNode);

    const handleAddNode = (nodeType: NodeTypeKey) => {
        // Add node at a random position for now
        // In a real app, you might want to add it at the center or use drag-and-drop
        const position = {
            x: Math.random() * 400 + 200,
            y: Math.random() * 300 + 100,
        };
        addNode(nodeType, position);
    };

    return (
        <SidebarProvider>
            <Sidebar className="mt-20">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>ADD NEW NODE</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => handleAddNode(item.nodeType)}
                                            >
                                                <item.icon style={{ color: item.color }} />
                                                <span>{item.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}