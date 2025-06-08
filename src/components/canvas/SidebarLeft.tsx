import { Hash, Cog, Phone, Grid3X3, Square } from "lucide-react"

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

// Menu items.
const items = [
    {
        title: "Conversation",
        url: "#",
        icon: Hash,
        color: "#8B5CF6", // Purple
    },
    {
        title: "Function",
        url: "#",
        icon: Cog,
        color: "#3B82F6", // Blue
    },
    {
        title: "Call Transfer",
        url: "#",
        icon: Phone,
        color: "#10B981", // Green
    },
    {
        title: "Press Digit",
        url: "#",
        icon: Grid3X3,
        color: "#F59E0B", // Orange
    },
    {
        title: "Ending",
        url: "#",
        icon: Square,
        color: "#EF4444", // Red
    },
]

export function SidebarLeft() {
    return (
        <SidebarProvider>
            <Sidebar className="mt-20">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            {/* <a href={item.url}> */}
                                            <div>
                                                <item.icon style={{ color: item.color }} />
                                                <span>{item.title}</span>
                                            </div>
                                            {/* </a> */}
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