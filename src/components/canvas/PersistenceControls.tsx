'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Upload,
    Download,
    RotateCcw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { usePersistence } from '@/hooks/usePersistence';
import { useFlowStore } from '@/stores/flowStore';

export function PersistenceControls() {
    const {
        saveToFile,
        loadFromFile,
        clearStorage,
        getStorageInfo
    } = usePersistence();

    const { nodes, edges } = useFlowStore();
    const [storageInfo, setStorageInfo] = useState(getStorageInfo());
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Update storage info when nodes/edges change
    useEffect(() => {
        setStorageInfo(getStorageInfo());
        setLastSaved(new Date());
    }, [nodes, edges, getStorageInfo]);

    const handleLoadFromFile = async () => {
        const success = await loadFromFile();
        if (success) {
            setStorageInfo(getStorageInfo());
            setLastSaved(new Date());
        }
    };

    const handleClearStorage = () => {
        clearStorage();
        setStorageInfo(getStorageInfo());
        setLastSaved(null);
    };

    return (
        <TooltipProvider>
            <div className="flex items-center space-x-2">
                {/* Auto-save status indicator */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1"
                >
                    {storageInfo.hasData ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-600">
                        {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
                    </span>
                </motion.div>

                {/* File operations */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={saveToFile}
                            className="h-8 w-8 p-0"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Export flow to file</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLoadFromFile}
                            className="h-8 w-8 p-0"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Import flow from file</p>
                    </TooltipContent>
                </Tooltip>

                {/* Reset button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearStorage}
                            className="h-8 w-8 p-0"
                            disabled={!storageInfo.hasData}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Clear storage & reset flow</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

// Minimal status component for header
export function PersistenceStatus() {
    const { nodes, edges } = useFlowStore();
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        setLastSaved(new Date());
    }, [nodes, edges]);

    return (
        <span className="text-sm text-gray-500">
            Auto saved at {lastSaved?.toLocaleTimeString() || '--:--:--'}
        </span>
    );
} 