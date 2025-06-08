'use client'
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, Copy, Clock } from 'lucide-react';
import { headerData } from '@/lib/canvas-data';

export function Header() {
    return (
        <header className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center">
                <Link href="/" className="p-2 rounded-md hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div className="ml-4">
                    <div className="flex items-center">
                        <h1 className="text-lg font-semibold text-gray-800">{headerData.title}</h1>
                        <button className="ml-2 p-1 rounded-md hover:bg-gray-100">
                            <Pencil className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <span>{headerData.conversationFlow}</span>
                        <div className="flex items-center">
                            <span>Agent ID: {headerData.agentId}</span>
                            <button className="ml-1 p-1 rounded-md hover:bg-gray-100">
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="flex items-center">
                            <span>Conversation flow ID: {headerData.conversationFlowId}</span>
                            <button className="ml-1 p-1 rounded-md hover:bg-gray-100">
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <span>{headerData.price}</span>
                        <div className="flex items-center">
                            <span>Estimated Latency: {headerData.latency}</span>
                            <Clock className="ml-1 h-3 w-3" />
                        </div>
                        <span>Auto saved at {headerData.autoSaveTime}</span>
                    </div>
                </div>
            </div>
        </header>
    );
} 