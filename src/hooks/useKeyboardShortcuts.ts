import { useEffect, useState, useCallback } from 'react';
import { NodeTypeKey } from '@/stores/flowStore';
import { useSmartNodePlacement } from './useSmartNodePlacement';

const keyToNodeType: Record<string, NodeTypeKey> = {
	c: 'conversation',
	f: 'function',
	t: 'callTransfer',
	d: 'pressDigit',
	e: 'endCall'
};

export const useKeyboardShortcuts = () => {
	const [keyboardHintVisible, setKeyboardHintVisible] = useState(false);
	const { addNodeSmart } = useSmartNodePlacement();

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			// Skip if user is typing in an input field or using modifier keys
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.ctrlKey ||
				event.metaKey ||
				event.altKey ||
				event.key === 'Delete' ||
				event.key === 'Backspace'
			) {
				return;
			}

			const nodeType = keyToNodeType[event.key.toLowerCase()];
			if (nodeType) {
				// Add the node
				addNodeSmart(nodeType);

				// Show keyboard hint
				setKeyboardHintVisible(true);
				setTimeout(() => setKeyboardHintVisible(false), 2000);

				// Prevent default behavior
				event.preventDefault();
			}
		},
		[addNodeSmart]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);
		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	return {
		keyboardHintVisible,
		setKeyboardHintVisible
	};
};
