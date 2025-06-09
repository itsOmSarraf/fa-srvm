'use client'
import React from 'react'
import { Playground } from '@/components/canvas/Playground'
import { Header } from '@/components/canvas/Header'
import { SidebarLeft } from '@/components/canvas/SidebarLeft'
import { SidebarRight } from '@/components/canvas/SidebarRight'
import { AIWorkflowChat } from '@/components/canvas/AIWorkflowChat'
import { CanvasTour } from '@/components/canvas/CanvasTour'
import { motion } from 'framer-motion'
import { useFlowStore } from '@/stores/flowStore'

function Page() {
    const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
    const isSidebarCollapsed = useFlowStore((state) => state.isSidebarCollapsed);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col w-full min-h-screen"
        >
            <Header />
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex w-full flex-1 relative"
            >
                <SidebarLeft />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                    className="flex-1 relative"
                    style={{
                        marginLeft: isSidebarCollapsed ? '0' : '256px', // 16rem = 256px for w-64
                        marginRight: selectedNodeId ? '320px' : '0', // 20rem = 320px for w-80
                        transition: 'margin 0.3s ease-in-out'
                    }}
                >
                    <Playground />
                </motion.div>
                <SidebarRight />
            </motion.div>
            <AIWorkflowChat />
            <CanvasTour />
        </motion.div>
    )
}

export default Page