import { useCallback, useEffect, useState } from 'react';
import { useFlowStore } from '@/stores/flowStore';
import { usePersistence } from './usePersistence';

interface AdvancedPersistenceOptions {
	autoBackup?: boolean;
	backupInterval?: number; // in milliseconds
	maxBackups?: number;
	compression?: boolean;
}

export const useAdvancedPersistence = (
	options: AdvancedPersistenceOptions = {}
) => {
	const {
		autoBackup = true,
		backupInterval = 5 * 60 * 1000, // 5 minutes
		maxBackups = 10,
		compression = true
	} = options;

	const { exportFlow, importFlow } = usePersistence();
	const { nodes, edges } = useFlowStore();
	const [backupHistory, setBackupHistory] = useState<string[]>([]);

	// Simple compression using JSON minification and basic encoding
	const compressData = useCallback(
		(data: string): string => {
			if (!compression) return data;

			try {
				// Remove whitespace and compress JSON
				const minified = JSON.stringify(JSON.parse(data));
				// Base64 encode for additional compression
				return btoa(minified);
			} catch {
				return data;
			}
		},
		[compression]
	);

	const decompressData = useCallback(
		(data: string): string => {
			if (!compression) return data;

			try {
				// Check if data is base64 encoded
				const decoded = atob(data);
				// Validate JSON
				JSON.parse(decoded);
				return decoded;
			} catch {
				// Return original data if decompression fails
				return data;
			}
		},
		[compression]
	);

	// Create backup with metadata
	const createBackup = useCallback(() => {
		const flowData = exportFlow();
		const compressed = compressData(flowData);
		const backup = {
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
			data: compressed,
			nodeCount: nodes.length,
			edgeCount: edges.length
		};

		const backupString = JSON.stringify(backup);
		const newBackups = [backupString, ...backupHistory].slice(0, maxBackups);
		setBackupHistory(newBackups);

		// Store in localStorage with different key
		localStorage.setItem('flow-backups', JSON.stringify(newBackups));

		return backup.id;
	}, [
		exportFlow,
		compressData,
		nodes.length,
		edges.length,
		backupHistory,
		maxBackups
	]);

	// Restore from backup
	const restoreBackup = useCallback(
		(backupId: string): boolean => {
			try {
				const backup = backupHistory.find((b) => {
					const parsed = JSON.parse(b);
					return parsed.id === backupId;
				});

				if (!backup) return false;

				const parsed = JSON.parse(backup);
				const flowData = decompressData(parsed.data);
				return importFlow(flowData);
			} catch {
				return false;
			}
		},
		[backupHistory, decompressData, importFlow]
	);

	// Get backup list with metadata
	const getBackupList = useCallback(() => {
		return backupHistory
			.map((backup) => {
				try {
					const parsed = JSON.parse(backup);
					return {
						id: parsed.id,
						timestamp: parsed.timestamp,
						nodeCount: parsed.nodeCount,
						edgeCount: parsed.edgeCount,
						size: new Blob([backup]).size
					};
				} catch {
					return null;
				}
			})
			.filter(Boolean);
	}, [backupHistory]);

	// Bulk export - export multiple backups as a single file
	const bulkExport = useCallback(() => {
		const backupData = {
			version: '1.0',
			exportTime: new Date().toISOString(),
			backups: backupHistory
				.map((backup) => {
					try {
						return JSON.parse(backup);
					} catch {
						return null;
					}
				})
				.filter(Boolean)
		};

		const blob = new Blob([JSON.stringify(backupData, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `flow-backups-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [backupHistory]);

	// Bulk import - import multiple backups from a file
	const bulkImport = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json';
			input.onchange = (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = (event) => {
						try {
							const content = event.target?.result as string;
							const parsed = JSON.parse(content);

							if (parsed.backups && Array.isArray(parsed.backups)) {
								const backupStrings = parsed.backups.map((backup: any) =>
									JSON.stringify(backup)
								);
								setBackupHistory(backupStrings);
								localStorage.setItem(
									'flow-backups',
									JSON.stringify(backupStrings)
								);
								resolve(true);
							} else {
								resolve(false);
							}
						} catch {
							resolve(false);
						}
					};
					reader.onerror = () => resolve(false);
					reader.readAsText(file);
				} else {
					resolve(false);
				}
			};
			input.click();
		});
	}, []);

	// Load backup history from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem('flow-backups');
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					setBackupHistory(parsed);
				}
			}
		} catch {
			// Ignore errors
		}
	}, []);

	// Auto-backup functionality
	useEffect(() => {
		if (!autoBackup) return;

		const interval = setInterval(() => {
			createBackup();
		}, backupInterval);

		return () => clearInterval(interval);
	}, [autoBackup, backupInterval, createBackup]);

	// Create initial backup on first load
	useEffect(() => {
		if (autoBackup && nodes.length > 0) {
			createBackup();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	return {
		createBackup,
		restoreBackup,
		getBackupList,
		bulkExport,
		bulkImport,
		backupHistory: getBackupList(),
		clearBackups: () => {
			setBackupHistory([]);
			localStorage.removeItem('flow-backups');
		}
	};
};
