import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { NodeConfigPanel } from "./config/NodeConfigPanel"

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


export function SidebarRight() {
    return (
        <SidebarProvider>
            <Sidebar side="right" className="mt-20 w-1/4">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Node Configuration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NodeConfigPanel />
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}