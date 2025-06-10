import { useCallback } from 'react';
import { useFlowStore, FlowNode } from '@/stores/flowStore';
import { Edge } from '@xyflow/react';

interface LayoutOptions {
	nodeWidth?: number;
	nodeHeight?: number;
	horizontalSpacing?: number;
	verticalSpacing?: number;
	padding?: number;
}

export const useAutoLayout = () => {
	/**
	 * Grid Layout - Arranges nodes in a neat grid pattern
	 */
	const applyGridLayout = useCallback((options: LayoutOptions = {}) => {
		const {
			nodeWidth = 240,
			nodeHeight = 120,
			horizontalSpacing = 50,
			verticalSpacing = 50,
			padding = 100
		} = options;

		const store = useFlowStore.getState();
		const { nodes } = store;

		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		const availableWidth = viewport.width - padding * 2;
		const totalNodeWidth = nodeWidth + horizontalSpacing;
		const cols = Math.max(1, Math.floor(availableWidth / totalNodeWidth));

		const layoutedNodes = nodes.map((node, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;

			// Center the grid
			const totalGridWidth =
				Math.min(nodes.length, cols) * totalNodeWidth - horizontalSpacing;
			const startX = (viewport.width - totalGridWidth) / 2;

			return {
				...node,
				position: {
					x: startX + col * totalNodeWidth,
					y: padding + row * (nodeHeight + verticalSpacing)
				}
			};
		});

		store.setNodes(layoutedNodes);
	}, []);

	/**
	 * Hierarchical Layout - Uses edge information to create proper hierarchy
	 */
	const applyHierarchicalLayout = useCallback((options: LayoutOptions = {}) => {
		const {
			nodeWidth = 240,
			nodeHeight = 120,
			horizontalSpacing = 50,
			verticalSpacing = 150,
			padding = 100
		} = options;

		const store = useFlowStore.getState();
		const { nodes, edges } = store;

		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		// Build adjacency list from edges
		const adjacencyList = new Map<string, string[]>();
		const incomingEdges = new Map<string, string[]>();

		nodes.forEach((node) => {
			adjacencyList.set(node.id, []);
			incomingEdges.set(node.id, []);
		});

		edges.forEach((edge) => {
			const sourceChildren = adjacencyList.get(edge.source) || [];
			sourceChildren.push(edge.target);
			adjacencyList.set(edge.source, sourceChildren);

			const targetParents = incomingEdges.get(edge.target) || [];
			targetParents.push(edge.source);
			incomingEdges.set(edge.target, targetParents);
		});

		// Find root nodes (nodes with no incoming edges or input nodes)
		const rootNodes = nodes.filter(
			(node) =>
				node.type === 'input' || (incomingEdges.get(node.id) || []).length === 0
		);

		if (rootNodes.length === 0) {
			// Fallback to grid layout if no clear hierarchy
			applyGridLayout(options);
			return;
		}

		// Assign levels using BFS
		const levels = new Map<string, number>();
		const queue = rootNodes.map((node) => ({ id: node.id, level: 0 }));

		while (queue.length > 0) {
			const { id, level } = queue.shift()!;

			if (levels.has(id)) continue;
			levels.set(id, level);

			const children = adjacencyList.get(id) || [];
			children.forEach((childId) => {
				if (!levels.has(childId)) {
					queue.push({ id: childId, level: level + 1 });
				}
			});
		}

		// Group nodes by level
		const nodesByLevel = new Map<number, FlowNode[]>();
		nodes.forEach((node) => {
			const level = levels.get(node.id) ?? 0;
			if (!nodesByLevel.has(level)) {
				nodesByLevel.set(level, []);
			}
			nodesByLevel.get(level)!.push(node);
		});

		// Position nodes
		const layoutedNodes: FlowNode[] = [];

		nodesByLevel.forEach((levelNodes, level) => {
			const totalLevelWidth =
				levelNodes.length * (nodeWidth + horizontalSpacing) - horizontalSpacing;
			const startX = (viewport.width - totalLevelWidth) / 2;
			const y = padding + level * verticalSpacing;

			levelNodes.forEach((node, index) => {
				layoutedNodes.push({
					...node,
					position: {
						x: startX + index * (nodeWidth + horizontalSpacing),
						y
					}
				});
			});
		});

		store.setNodes(layoutedNodes);
	}, []);

	/**
	 * Circular Layout - Arranges nodes in a circle
	 */
	const applyCircularLayout = useCallback((options: LayoutOptions = {}) => {
		const store = useFlowStore.getState();
		const { nodes } = store;

		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		if (nodes.length === 0) return;

		if (nodes.length === 1) {
			store.setNodes([
				{
					...nodes[0],
					position: {
						x: viewport.width / 2 - 120,
						y: viewport.height / 2 - 60
					}
				}
			]);
			return;
		}

		const centerX = viewport.width / 2;
		const centerY = viewport.height / 2;
		const radius = Math.min(centerX, centerY) * 0.6;

		const layoutedNodes = nodes.map((node, index) => {
			const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2; // Start from top
			const x = centerX + Math.cos(angle) * radius - 120;
			const y = centerY + Math.sin(angle) * radius - 60;

			return {
				...node,
				position: { x, y }
			};
		});

		store.setNodes(layoutedNodes);
	}, []);

	/**
	 * Force Layout - Simple physics-based layout
	 */
	const applyForceLayout = useCallback((options: LayoutOptions = {}) => {
		const store = useFlowStore.getState();
		const { nodes, edges } = store;

		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		const centerX = viewport.width / 2;
		const centerY = viewport.height / 2;
		const spread = 300;

		// Use edges to influence positioning
		const nodePositions = new Map<string, { x: number; y: number }>();

		// Start with random positions around center
		nodes.forEach((node, index) => {
			const angle = (index / nodes.length) * 2 * Math.PI;
			const distance = Math.random() * spread + 100;
			nodePositions.set(node.id, {
				x: centerX + Math.cos(angle) * distance,
				y: centerY + Math.sin(angle) * distance
			});
		});

		// Apply simple force simulation for a few iterations
		for (let iteration = 0; iteration < 50; iteration++) {
			const forces = new Map<string, { x: number; y: number }>();

			// Initialize forces
			nodes.forEach((node) => {
				forces.set(node.id, { x: 0, y: 0 });
			});

			// Repulsion between all nodes
			nodes.forEach((nodeA) => {
				nodes.forEach((nodeB) => {
					if (nodeA.id === nodeB.id) return;

					const posA = nodePositions.get(nodeA.id)!;
					const posB = nodePositions.get(nodeB.id)!;

					const dx = posA.x - posB.x;
					const dy = posA.y - posB.y;
					const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

					const repulsion = 1000 / (distance * distance);
					const forceA = forces.get(nodeA.id)!;
					forceA.x += (dx / distance) * repulsion;
					forceA.y += (dy / distance) * repulsion;
				});
			});

			// Attraction along edges
			edges.forEach((edge) => {
				const sourcePos = nodePositions.get(edge.source);
				const targetPos = nodePositions.get(edge.target);

				if (!sourcePos || !targetPos) return;

				const dx = targetPos.x - sourcePos.x;
				const dy = targetPos.y - sourcePos.y;
				const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

				const attraction = distance * 0.01;

				const sourceForce = forces.get(edge.source)!;
				const targetForce = forces.get(edge.target)!;

				sourceForce.x += (dx / distance) * attraction;
				sourceForce.y += (dy / distance) * attraction;
				targetForce.x -= (dx / distance) * attraction;
				targetForce.y -= (dy / distance) * attraction;
			});

			// Apply forces
			nodes.forEach((node) => {
				const pos = nodePositions.get(node.id)!;
				const force = forces.get(node.id)!;

				pos.x += force.x * 0.1;
				pos.y += force.y * 0.1;

				// Keep nodes within bounds
				pos.x = Math.max(100, Math.min(viewport.width - 100, pos.x));
				pos.y = Math.max(100, Math.min(viewport.height - 100, pos.y));
			});
		}

		const layoutedNodes = nodes.map((node) => {
			const pos = nodePositions.get(node.id)!;
			return {
				...node,
				position: { x: pos.x - 120, y: pos.y - 60 }
			};
		});

		store.setNodes(layoutedNodes);
	}, []);

	/**
	 * Organic Layout - Attempts to create a natural, flowing arrangement
	 */
	const applyOrganicLayout = useCallback((options: LayoutOptions = {}) => {
		const {
			nodeWidth = 240,
			nodeHeight = 120,
			horizontalSpacing = 100,
			verticalSpacing = 100
		} = options;

		const store = useFlowStore.getState();
		const { nodes, edges } = store;

		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		// Create a flow-like arrangement following the edges
		const visited = new Set<string>();
		const positioned = new Map<string, { x: number; y: number }>();

		// Find start node
		const startNode = nodes.find((node) => node.type === 'input') || nodes[0];
		if (!startNode) return;

		// Position start node at center-left
		const startX = viewport.width * 0.2;
		const startY = viewport.height * 0.5;
		positioned.set(startNode.id, { x: startX, y: startY });

		// Use BFS-like approach but with organic positioning
		const queue = [{ nodeId: startNode.id, x: startX, y: startY, level: 0 }];
		visited.add(startNode.id);

		while (queue.length > 0) {
			const { nodeId, x, y, level } = queue.shift()!;

			// Find children of current node
			const childEdges = edges.filter((edge) => edge.source === nodeId);
			const children = childEdges.map((edge) => edge.target);

			children.forEach((childId, index) => {
				if (visited.has(childId)) return;

				visited.add(childId);

				// Position children in a flowing pattern
				const angleSpread = Math.PI / 3; // 60 degrees
				const baseAngle = level * 0.2; // Slight rotation per level
				const childAngle =
					baseAngle +
					(index - (children.length - 1) / 2) *
						(angleSpread / Math.max(children.length - 1, 1));

				const distance = horizontalSpacing + Math.random() * 50;
				const childX = x + Math.cos(childAngle) * distance;
				const childY = y + Math.sin(childAngle) * distance;

				positioned.set(childId, { x: childX, y: childY });
				queue.push({ nodeId: childId, x: childX, y: childY, level: level + 1 });
			});
		}

		// Position any remaining unconnected nodes
		nodes.forEach((node) => {
			if (!positioned.has(node.id)) {
				positioned.set(node.id, {
					x: viewport.width * 0.8 + Math.random() * 200 - 100,
					y: viewport.height * 0.3 + Math.random() * 200
				});
			}
		});

		const layoutedNodes = nodes.map((node) => {
			const pos = positioned.get(node.id)!;
			return {
				...node,
				position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 }
			};
		});

		store.setNodes(layoutedNodes);
	}, []);

	return {
		applyGridLayout,
		applyHierarchicalLayout,
		applyCircularLayout,
		applyForceLayout,
		applyOrganicLayout
	};
};
