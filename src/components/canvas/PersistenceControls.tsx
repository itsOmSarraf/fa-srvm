'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Upload,
    Download,
    RotateCcw,
    Info,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        setIsDialogOpen(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

                {/* Storage info dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <Info className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Storage information</p>
                            </TooltipContent>
                        </Tooltip>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Storage Information</DialogTitle>
                            <DialogDescription>
                                Current flow storage status and controls
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Nodes</p>
                                    <Badge variant="secondary">{storageInfo.nodeCount}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Connections</p>
                                    <Badge variant="secondary">{storageInfo.edgeCount}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Storage Size</p>
                                    <Badge variant="secondary">{formatFileSize(storageInfo.size)}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge variant={storageInfo.hasData ? "default" : "destructive"}>
                                        {storageInfo.hasData ? "Persisted" : "Empty"}
                                    </Badge>
                                </div>
                            </div>

                            {storageInfo.hasData && (
                                <div className="pt-4 border-t">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleClearStorage}
                                        className="w-full"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Clear Storage & Reset
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        This will remove all saved data and reset to default state
                                    </p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

// Minimal status component for header
export function PersistenceStatus() {
    const { getStorageInfo } = usePersistence();
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