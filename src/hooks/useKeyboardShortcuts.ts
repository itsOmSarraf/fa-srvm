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
	const { addNode, isSidebarCollapsed, selectedNodeId } = useFlowStore();

	// Calculate smart placement area based on sidebar states
	const getPlacementArea = () => {
		const leftMargin = isSidebarCollapsed ? 50 : 300; // Account for left sidebar
		const rightMargin = selectedNodeId ? 350 : 50; // Account for right sidebar
		const topMargin = 120; // Account for header
		const bottomMargin = 100; // Keep some bottom padding

		const availableWidth = Math.max(
			400,
			window.innerWidth - leftMargin - rightMargin
		);
		const availableHeight = Math.max(
			300,
			window.innerHeight - topMargin - bottomMargin
		);

		return {
			x: {
				min: leftMargin,
				max: leftMargin + availableWidth,
				center: leftMargin + availableWidth / 2
			},
			y: {
				min: topMargin,
				max: topMargin + availableHeight,
				center: topMargin + availableHeight / 2
			}
		};
	};

	const getRandomPosition = () => {
		const area = getPlacementArea();

		// Use a more generous random spread around the center
		const spreadX = Math.min(300, (area.x.max - area.x.min) * 0.4);
		const spreadY = Math.min(200, (area.y.max - area.y.min) * 0.3);

		return {
			x: area.x.center + (Math.random() - 0.5) * spreadX,
			y: area.y.center + (Math.random() - 0.5) * spreadY
		};
	};

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

				// Use smart positioning instead of fixed values
				const position = getRandomPosition();
				addNode(nodeType, position);
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [addNode, isSidebarCollapsed, selectedNodeId]); // Add dependencies for recalculation
};
