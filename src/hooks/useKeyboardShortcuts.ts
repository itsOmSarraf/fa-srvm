import { useEffect } from 'react';
import { useFlowStore, NodeTypeKey } from '@/stores/flowStore';

const keyToNodeType: Record<string, NodeTypeKey> = {
	c: 'conversation',
	f: 'function',
	t: 'callTransfer',
	d: 'pressDigit',
	e: 'endCall'
};

export const useKeyboardShortcuts = () => {
	const { addNode } = useFlowStore();

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

				// Add node at a reasonable default position with some randomness
				const position = {
					x: Math.random() * 400 + 200,
					y: Math.random() * 300 + 150
				};

				addNode(nodeType, position);
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [addNode]);
};
