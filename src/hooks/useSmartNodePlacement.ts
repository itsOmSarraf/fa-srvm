import { useCallback } from 'react';
import { useFlowStore } from '@/stores/flowStore';
import type { NodeTypeKey } from '@/stores/flowStore';

interface Position {
	x: number;
	y: number;
}

export const useSmartNodePlacement = () => {
	const { nodes, _createNode } = useFlowStore();

	/**
	 * Find a position that doesn't overlap with existing nodes (very lenient)
	 */
	const findNonOverlappingPosition = useCallback(
		(targetPosition: Position, existingNodes: typeof nodes): Position => {
			// Much smaller distances to allow closer placement and overlaps
			const nodeWidth = 200; // Approximate node width
			const nodeHeight = 100; // Approximate node height
			const minDistance = 10; // Much smaller minimum distance - allow near overlaps

			let position = { ...targetPosition };
			let attempts = 0;
			const maxAttempts = 5; // Fewer attempts - be less picky about placement

			while (attempts < maxAttempts) {
				let hasOverlap = false;

				for (const node of existingNodes) {
					const distance = Math.sqrt(
						Math.pow(position.x - node.position.x, 2) +
							Math.pow(position.y - node.position.y, 2)
					);

					// Much more lenient overlap check - only avoid direct overlap
					if (distance < minDistance) {
						hasOverlap = true;
						break;
					}
				}

				if (!hasOverlap) {
					break;
				}

				// Smaller spiral pattern - stay closer to target
				const spiralRadius = 20 + attempts * 15; // Smaller spiral
				const spiralAngle = attempts * 0.5;

				position = {
					x: targetPosition.x + Math.cos(spiralAngle) * spiralRadius,
					y: targetPosition.y + Math.sin(spiralAngle) * spiralRadius
				};

				attempts++;
			}

			return position;
		},
		[]
	);

	/**
	 * Calculate the optimal position for a new node based on existing nodes
	 */
	const calculateOptimalPosition = useCallback((): Position => {
		// Filter out input/output nodes and focus on user-created nodes
		const userNodes = nodes.filter(
			(node) =>
				node.type !== 'input' && node.type !== 'output' && node.id !== 'start'
		);

		if (userNodes.length === 0) {
			// If no user nodes exist, place near the start node
			const startNode = nodes.find((node) => node.id === 'start');
			if (startNode) {
				return {
					x: startNode.position.x + 300,
					y: startNode.position.y + (Math.random() - 0.5) * 100
				};
			}
			// Fallback to center-right of canvas
			return { x: 400, y: 200 };
		}

		// Calculate the center of mass of existing nodes
		const centerX =
			userNodes.reduce((sum, node) => sum + node.position.x, 0) /
			userNodes.length;
		const centerY =
			userNodes.reduce((sum, node) => sum + node.position.y, 0) /
			userNodes.length;

		// Make nodes much closer - reduced from 150 to 50
		const offsetRadius = 50; // Much closer distance from center
		const angle = Math.random() * 2 * Math.PI; // Random angle

		const newX = centerX + Math.cos(angle) * offsetRadius;
		const newY = centerY + Math.sin(angle) * offsetRadius;

		// Allow overlapping - much more lenient overlap detection
		return findNonOverlappingPosition({ x: newX, y: newY }, userNodes);
	}, [nodes, findNonOverlappingPosition]);

	/**
	 * Add a node with smart positioning
	 */
	const addNodeSmart = useCallback(
		(nodeType: NodeTypeKey) => {
			const position = calculateOptimalPosition();
			_createNode(nodeType, position);
		},
		[_createNode, calculateOptimalPosition]
	);

	/**
	 * Get the optimal position without adding a node (useful for previews)
	 */
	const getOptimalPosition = useCallback(() => {
		return calculateOptimalPosition();
	}, [calculateOptimalPosition]);

	return {
		addNodeSmart,
		getOptimalPosition,
		calculateOptimalPosition
	};
};
