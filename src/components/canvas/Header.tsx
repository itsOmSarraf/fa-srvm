'use client'
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, Copy, Clock } from 'lucide-react';
import { headerData } from '@/lib/canvas-data';
import { motion } from 'framer-motion';

export function Header() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: 0.1
            }}
            className="bg-white p-2 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95"
        >
            <div className="flex items-center">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Link href="/" className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </Link>
                </motion.div>
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="ml-4"
                >
                    <div className="flex items-center">
                        <h1 className="text-lg font-semibold text-gray-800">{headerData.title}</h1>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                            <Pencil className="h-4 w-4 text-gray-500" />
                        </motion.button>
                    </div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex items-center text-sm text-gray-500 mt-1 space-x-4"
                    >
                        <span>{headerData.conversationFlow}</span>
                        <div className="flex items-center">
                            <span>Agent ID: {headerData.agentId}</span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                <Copy className="h-3 w-3" />
                            </motion.button>
                        </div>
                        <div className="flex items-center">
                            <span>Conversation flow ID: {headerData.conversationFlowId}</span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                <Copy className="h-3 w-3" />
                            </motion.button>
                        </div>
                        <span>{headerData.price}</span>
                        <div className="flex items-center">
                            <span>Estimated Latency: {headerData.latency}</span>
                            <Clock className="ml-1 h-3 w-3" />
                        </div>
                        <span>Auto saved at {headerData.autoSaveTime}</span>
                    </motion.div>
                </motion.div>
            </div>
        </motion.header>
    );
} 