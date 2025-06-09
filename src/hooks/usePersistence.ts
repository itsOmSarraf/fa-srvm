import { useCallback } from 'react';
import { useFlowStore } from '@/stores/flowStore';

export const usePersistence = () => {
	const { clearStorage, exportFlow, importFlow } = useFlowStore();

	// Save current flow to a file
	const saveToFile = useCallback(() => {
		const flowData = exportFlow();
		const blob = new Blob([flowData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `flow-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [exportFlow]);

	// Load flow from a file
	const loadFromFile = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json';
			input.onchange = (e) => {
				const file = (e.target as HTMLInputElement).files?.[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = (event) => {
						const content = event.target?.result as string;
						const success = importFlow(content);
						resolve(success);
					};
					reader.onerror = () => resolve(false);
					reader.readAsText(file);
				} else {
					resolve(false);
				}
			};
			input.click();
		});
	}, [importFlow]);

	// Get storage info
	const getStorageInfo = useCallback(() => {
		try {
			const storageKey = 'flow-storage';
			const data = localStorage.getItem(storageKey);
			if (data) {
				const parsed = JSON.parse(data);
				return {
					hasData: true,
					size: new Blob([data]).size,
					nodeCount: parsed.state?.nodes?.length || 0,
					edgeCount: parsed.state?.edges?.length || 0,
					lastModified: parsed.state?.timestamp || null
				};
			}
			return {
				hasData: false,
				size: 0,
				nodeCount: 0,
				edgeCount: 0,
				lastModified: null
			};
		} catch {
			return {
				hasData: false,
				size: 0,
				nodeCount: 0,
				edgeCount: 0,
				lastModified: null
			};
		}
	}, []);

	// Auto-save functionality
	const enableAutoSave = useCallback((intervalMs: number = 30000) => {
		const interval = setInterval(() => {
			// Auto-save is already handled by Zustand persist middleware
			// This could be used for additional backup mechanisms
			console.log('Auto-save triggered (data already persisted)');
		}, intervalMs);

		return () => clearInterval(interval);
	}, []);

	return {
		clearStorage,
		exportFlow,
		importFlow,
		saveToFile,
		loadFromFile,
		getStorageInfo,
		enableAutoSave
	};
};
