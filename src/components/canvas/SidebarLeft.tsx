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
    },
    {
        title: "Function",
        url: "#",
        icon: Cog,
    },
    {
        title: "Call Transfer",
        url: "#",
        icon: Phone,
    },
    {
        title: "Press Digit",
        url: "#",
        icon: Grid3X3,
    },
    {
        title: "Ending",
        url: "#",
        icon: Square,
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
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
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