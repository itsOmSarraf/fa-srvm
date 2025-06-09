'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, Step } from 'react-joyride';
import { useFlowStore } from '@/stores/flowStore';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Create tour steps dynamically to handle conditional elements
const createTourSteps = (isSidebarCollapsed: boolean): Step[] => [
    {
        target: 'body',
        content: (
            <div>
                <h2 className="text-lg font-semibold mb-2">Welcome to the Canvas!</h2>
                <p>This is your workflow design workspace. Let&#39;s take a quick tour to see all the features available to you.</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="header"]',
        content: (
            <div>
                <h3 className="text-lg font-semibold mb-2">Header Section</h3>
                <p>This shows your workflow information including title, Agent ID, conversation flow ID, estimated latency, and persistence controls.</p>
            </div>
        ),
        placement: 'bottom',
    },
    {
        target: '[data-tour="header-persistence"]',
        content: (
            <div>
                <h3 className="text-lg font-semibold mb-2">Persistence Controls</h3>
                <p>Save, load, and manage your workflow states. Your work is automatically saved as you build.</p>
            </div>
        ),
        placement: 'bottom',
    },
    {
        target: '[data-tour="playground"]',
        content: (
            <div>
                <h3 className="text-lg font-semibold mb-2">Workflow Canvas</h3>
                <p>This is your main workspace where you build your conversation flow. You can:</p>
                <ul className="text-sm mt-2 space-y-1">
                    <li>• Drag nodes to position them</li>
                    <li>• Connect nodes by dragging from handles</li>
                    <li>• Click nodes to select and configure them</li>
                    <li>• Use keyboard shortcuts (C, F, T, D, E) to quickly add nodes</li>
                </ul>
            </div>
        ),
        placement: 'top',
    },
    {
        target: isSidebarCollapsed ? '[data-tour="sidebar-left-toggle"]' : '[data-tour="sidebar-left"]',
        content: (
            <div>
                <h3 className="text-lg font-semibold mb-2">{isSidebarCollapsed ? 'Left Sidebar Toggle' : 'Node Types'}</h3>
                {isSidebarCollapsed ? (
                    <p>Click this button to expand the sidebar and see all available node types you can add to your workflow.</p>
                ) : (
                    <div>
                        <p>Choose from different node types:</p>
                        <ul className="text-sm mt-2 space-y-1">
                            <li><strong>Conversation:</strong> Handle voice interactions</li>
                            <li><strong>Function:</strong> Execute custom code</li>
                            <li><strong>Call Transfer:</strong> Transfer to another number</li>
                            <li><strong>Press Digit:</strong> Handle keypad input</li>
                            <li><strong>End Call:</strong> Terminate the call</li>
                        </ul>
                        <p className="text-sm mt-2">You can click to add or drag to position nodes.</p>
                    </div>
                )}
            </div>
        ),
        placement: 'right',
    },
    {
        target: '[data-tour="ai-chat"]',
        content: (
            <div>
                <h3 className="text-lg font-semibold mb-2">AI Workflow Assistant</h3>
                <p>Click this button to open the AI assistant. It can help you:</p>
                <ul className="text-sm mt-2 space-y-1">
                    <li>• Build workflows with natural language</li>
                    <li>• Suggest improvements to your current flow</li>
                    <li>• Add common conversation patterns</li>
                    <li>• Generate complete workflow sections</li>
                </ul>
            </div>
        ),
        placement: 'top',
    },
    {
        target: 'body',
        content: (
            <div>
                <h2 className="text-lg font-semibold mb-2">You&#39;re Ready!</h2>
                <p>You now know how to use all the main features of the canvas. Start building your conversation workflow by adding nodes from the left sidebar or using the AI assistant!</p>
                <p className="text-sm mt-2 text-gray-600">💡 <strong>Pro tip:</strong> Use keyboard shortcuts (C, F, T, D, E) for quick node creation!</p>
            </div>
        ),
        placement: 'center',
    },
];

interface CanvasTourProps {
    autoStart?: boolean;
}

export function CanvasTour({ autoStart = false }: CanvasTourProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [showStartButton, setShowStartButton] = useState(false);

    const { isSidebarCollapsed, setSidebarCollapsed } = useFlowStore();

    // Check if user has seen the tour before
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('canvas-tour-completed');
        if (!hasSeenTour && !autoStart) {
            // Show the start button for new users
            setShowStartButton(true);
        } else if (autoStart) {
            setIsRunning(true);
        }
    }, [autoStart]);

    // Handle tour events
    const handleJoyrideCallback = useCallback((data: CallBackProps) => {
        const { status, type, index } = data;

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            setIsRunning(false);
            setStepIndex(0);
            setShowStartButton(false);
            // Mark tour as completed
            localStorage.setItem('canvas-tour-completed', 'true');
        } else if (type === EVENTS.STEP_AFTER) {
            setStepIndex(index + 1);
        } else if (type === EVENTS.TARGET_NOT_FOUND) {
            console.warn(`Tour target not found for step ${index}`);
            // Skip to next step if target not found
            setStepIndex(index + 1);
        }
    }, []);

    const startTour = useCallback(() => {
        setIsRunning(true);
        setStepIndex(0);
        setShowStartButton(false);
    }, []);

    const stopTour = useCallback(() => {
        setIsRunning(false);
        setStepIndex(0);
        setShowStartButton(false);
    }, []);

    // Auto-start tour if specified
    useEffect(() => {
        if (autoStart) {
            setIsRunning(true);
            setShowStartButton(false);
        }
    }, [autoStart]);

    return (
        <>
            {/* Tour Start Button */}
            <AnimatePresence>
                {showStartButton && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <HelpCircle className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    First time here?
                                </span>
                            </div>
                            <Button
                                onClick={startTour}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Play className="w-4 h-4 mr-1" />
                                Take Tour
                            </Button>
                            <Button
                                onClick={() => setShowStartButton(false)}
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Button (always visible) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="fixed bottom-4 left-4 z-40"
            >
                <Button
                    onClick={startTour}
                    variant="outline"
                    size="sm"
                    className="bg-white border-gray-200 hover:bg-gray-50"
                    title="Take a tour of the canvas"
                >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help
                </Button>
            </motion.div>

            {/* Joyride Component */}
            <Joyride
                steps={createTourSteps(isSidebarCollapsed)}
                run={isRunning}
                stepIndex={stepIndex}
                callback={handleJoyrideCallback}
                continuous
                showProgress
                showSkipButton
                scrollToFirstStep
                scrollOffset={100}
                disableOverlayClose
                spotlightClicks
                debug={process.env.NODE_ENV === 'development'}
                styles={{
                    options: {
                        primaryColor: '#2563eb',
                        backgroundColor: '#ffffff',
                        textColor: '#374151',
                        zIndex: 10000,
                    },
                    tooltip: {
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                    },
                    tooltipTitle: {
                        fontSize: '16px',
                        fontWeight: '600',
                    },
                    buttonNext: {
                        backgroundColor: '#2563eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                    },
                    buttonBack: {
                        color: '#6b7280',
                        fontSize: '14px',
                    },
                    buttonSkip: {
                        color: '#6b7280',
                        fontSize: '14px',
                    },
                    beacon: {
                        cursor: 'pointer',
                    },
                }}
                locale={{
                    back: 'Previous',
                    close: 'Close',
                    last: 'Finish Tour',
                    next: 'Next',
                    skip: 'Skip Tour',
                }}
            />
        </>
    );
} 