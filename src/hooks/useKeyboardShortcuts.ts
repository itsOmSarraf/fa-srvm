import { useEffect, useCallback } from 'react';
import { useFlowStore, NodeTypeKey } from '@/stores/flowStore';
import { useSmartNodePlacement } from './useSmartNodePlacement';

const keyToNodeType: Record<string, NodeTypeKey> = {
	c: 'conversation',
	f: 'function',
	t: 'callTransfer',
	d: 'pressDigit',
	e: 'endCall'
};

export const useKeyboardShortcuts = () => {
	const { addNodeSmart } = useSmartNodePlacement();

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Only trigger if no input is focused and no modifier keys are pressed
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.ctrlKey ||
				event.metaKey ||
				event.altKey
			) {
				return;
			}

			const nodeType = keyToNodeType[event.key.toLowerCase()];
			if (nodeType) {
				event.preventDefault();
				addNodeSmart(nodeType);
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [addNodeSmart]);
};
