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
            {/* Mobile Warning Message */}
            <div className="md:hidden flex items-center justify-center min-h-screen bg-black  text-white p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="mb-8">
                        <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">
                        Desktop Required
                    </h1>
                    <p className="text-lg text-gray-300 mb-2">
                        Can't view on mobile
                    </p>
                    <p className="text-base text-gray-400">
                        Kindly switch to laptop or desktop for the best experience
                    </p>
                </motion.div>
            </div>

            {/* Desktop Canvas Content */}
            <div className="hidden md:flex md:flex-col md:w-full md:min-h-screen">
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
            </div>
        </motion.div>
    )
}

export default Page