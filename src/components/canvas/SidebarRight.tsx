import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { NodeConfigPanel } from "./config/NodeConfigPanel"
import { useFlowStore } from "@/stores/flowStore"
import { motion, AnimatePresence } from "framer-motion"

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
    const selectedNodeId = useFlowStore((state) => state.selectedNodeId);

    return (
        <AnimatePresence mode="wait">
            {selectedNodeId && (
                <motion.div
                    key="right-sidebar"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8
                    }}
                    className="fixed right-0 top-0 z-30 h-full"
                >
                    <SidebarProvider>
                        <Sidebar side="right" className="mt-20 w-80 h-full border-l border-gray-200 shadow-lg">
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
                </motion.div>
            )}
        </AnimatePresence>
    )
}