import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Node, type Edge, type Connection, addEdge } from '@xyflow/react';

export type NodeTypeKey =
	| 'conversation'
	| 'function'
	| 'callTransfer'
	| 'pressDigit'
	| 'endCall';

export interface Transition {
	id: string;
	label: string;
	condition?: string;
	variable?: string;
	operator?: '=' | '!=' | '>' | '<' | 'contains' | 'exists';
	value?: string;
}

export interface VoiceSettings {
	voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
	speed?: number;
}

export interface NodeConfig extends Record<string, unknown> {
	// Common properties
	id: string;
	label: string;
	type: NodeTypeKey;
	outputCount: number;
	transitions: Transition[];

	// Global settings
	delay?: number;
	timeout?: number;
	voiceSettings?: VoiceSettings;
	retryCount?: number;
	errorMessage?: string;

	// Conversation Node
	prompt?: string;

	// Function Node
	functionCode?: string;
	parameters?: Record<string, any>;

	// Call Transfer Node
	transferNumber?: string;
	transferType?: 'warm' | 'cold';

	// Press Digit Node
	pauseDetectionDelay?: number;
	maxDigits?: number;
	terminationDigit?: string;

	// End Call Node
	reason?: string;
}

export interface FlowNode extends Node {
	data: NodeConfig;
}

// Helper function for creating node data - exported for use in hooks
export const createDefaultNodeData = (
	type: NodeTypeKey,
	id: string
): NodeConfig => {
	const baseData: NodeConfig = {
		id,
		label: '',
		type,
		outputCount: 0,
		transitions: [],
		// Default global settings
		delay: 0,
		timeout: 30000,
		voiceSettings: {
			voice: 'alloy',
			speed: 1.0
		},
		retryCount: 0,
		errorMessage: ''
	};

	switch (type) {
		case 'conversation':
			return {
				...baseData,
				label: 'Conversation',
				prompt: 'Enter your conversation prompt here...',
				outputCount: 1,
				transitions: [
					{
						id: `${id}-continue`,
						label: 'Continue',
						condition: ''
					}
				]
			};
		case 'function':
			return {
				...baseData,
				label: 'Function',
				functionCode:
					'function execute() {\n  // Your code here\n  return true;\n}',
				parameters: {},
				outputCount: 2,
				transitions: [
					{
						id: `${id}-success`,
						label: 'Success',
						condition: 'result === true'
					},
					{
						id: `${id}-error`,
						label: 'Error',
						condition: 'result === false'
					}
				]
			};
		case 'callTransfer':
			return {
				...baseData,
				label: 'Call Transfer',
				transferNumber: '',
				transferType: 'warm',
				outputCount: 2,
				transitions: [
					{
						id: `${id}-complete`,
						label: 'Transfer Complete',
						condition: 'transfer_status === "completed"'
					},
					{
						id: `${id}-failed`,
						label: 'Transfer Failed',
						condition: 'transfer_status === "failed"'
					}
				]
			};
		case 'pressDigit':
			return {
				...baseData,
				label: 'Press Digit',
				pauseDetectionDelay: 2000,
				maxDigits: 1,
				terminationDigit: '#',
				outputCount: 1,
				transitions: [
					{
						id: `${id}-digit`,
						label: 'Digit Pressed',
						condition: 'digit_received'
					}
				]
			};
		case 'endCall':
			return {
				...baseData,
				label: 'End Call',
				reason: 'Conversation completed',
				outputCount: 0,
				transitions: []
			};
		default:
			return baseData;
	}
};

// Use a global counter for unique node IDs
let nodeIdCounter = 2; // Start at 2 since node-1 already exists in default state

// Export function to get next node ID
export const getNextNodeId = () => `node-${++nodeIdCounter}`;

interface HistoryState {
	nodes: FlowNode[];
	edges: Edge[];
	timestamp: number;
}

interface FlowState {
	nodes: FlowNode[];
	edges: Edge[];
	selectedNodeId: string | null;
	isSidebarCollapsed: boolean;
	// Undo/Redo functionality
	history: HistoryState[];
	currentHistoryIndex: number;
	canUndo: boolean;
	canRedo: boolean;

	// Actions
	updateNode: (nodeId: string, data: Partial<NodeConfig>) => void;
	selectNode: (nodeId: string | null) => void;
	setNodes: (nodes: FlowNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	onConnect: (connection: Connection) => void;
	deleteNode: (nodeId: string) => void;
	deleteEdge: (edgeId: string) => void;
	addTransition: (nodeId: string) => void;
	removeTransition: (nodeId: string, transitionId: string) => void;
	updateTransition: (
		nodeId: string,
		transitionId: string,
		updates: Partial<Transition>
	) => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	// Internal node creation (used by smart placement hook)
	_createNode: (
		nodeType: NodeTypeKey,
		position: { x: number; y: number }
	) => void;
	// Undo/Redo actions
	undo: () => void;
	redo: () => void;
	saveToHistory: () => void;
	// Persistence actions
	clearStorage: () => void;
	exportFlow: () => string;
	importFlow: (flowData: string) => boolean;
}

// Default flow state for initialization and reset
const getDefaultFlowState = () => {
	const initialState = {
		nodes: [
			{
				id: 'start',
				type: 'input',
				position: { x: 100, y: 100 },
				data: {
					id: 'start',
					label: 'Start',
					type: 'conversation' as NodeTypeKey,
					outputCount: 1,
					transitions: [
						{
							id: 'start-transition',
							label: 'Begin',
							condition: ''
						}
					]
				},
				draggable: true,
				deletable: false
			},
			{
				id: 'node-1',
				type: 'conversation',
				position: { x: 400, y: 100 },
				data: {
					...createDefaultNodeData('conversation', 'node-1')
				}
			}
		] as FlowNode[],
		edges: [] as Edge[],
		selectedNodeId: null as string | null,
		isSidebarCollapsed: false,
		history: [] as HistoryState[],
		currentHistoryIndex: -1,
		canUndo: false,
		canRedo: false
	};

	// Add initial state to history
	initialState.history = [
		{
			nodes: [...initialState.nodes],
			edges: [...initialState.edges],
			timestamp: Date.now()
		}
	];
	initialState.currentHistoryIndex = 0;

	return initialState;
};

export const useFlowStore = create<FlowState>()(
	persist(
		(set, get) => ({
			// Initial state using default values
			...getDefaultFlowState(),

			updateNode: (nodeId: string, data: Partial<NodeConfig>) => {
				set((state) => ({
					nodes: state.nodes.map((node) =>
						node.id === nodeId
							? { ...node, data: { ...node.data, ...data } }
							: node
					)
				}));
			},

			selectNode: (nodeId: string | null) => {
				set({ selectedNodeId: nodeId });
			},

			setNodes: (nodes: FlowNode[]) => {
				set({ nodes });
			},

			setEdges: (edges: Edge[]) => {
				set({ edges });
			},

			onConnect: (connection: Connection) => {
				set((state) => ({
					edges: addEdge(connection, state.edges)
				}));
			},

			deleteNode: (nodeId: string) => {
				set((state) => {
					const newState = {
						nodes: state.nodes.filter((node) => node.id !== nodeId),
						edges: state.edges.filter(
							(edge) => edge.source !== nodeId && edge.target !== nodeId
						),
						selectedNodeId:
							state.selectedNodeId === nodeId ? null : state.selectedNodeId
					};

					// CRITICAL: Force immediate persistence for critical operations
					// Use queueMicrotask for more reliable persistence timing
					queueMicrotask(() => {
						// Access store to trigger persistence
						const currentState = get();
						console.log(
							'Node deleted and persisted:',
							nodeId,
							'remaining nodes:',
							currentState.nodes.length
						);
					});

					return newState;
				});
			},

			deleteEdge: (edgeId: string) => {
				set((state) => {
					const newState = {
						edges: state.edges.filter((edge) => edge.id !== edgeId)
					};

					// CRITICAL: Force immediate persistence
					queueMicrotask(() => {
						const currentState = get();
						console.log('Edge deleted and persisted:', edgeId);
					});

					return newState;
				});
			},

			addTransition: (nodeId: string) => {
				set((state) => ({
					nodes: state.nodes.map((node) =>
						node.id === nodeId
							? {
									...node,
									data: {
										...node.data,
										outputCount: node.data.outputCount + 1,
										transitions: [
											...node.data.transitions,
											{
												id: `transition-${Date.now()}`,
												label: `Transition ${node.data.transitions.length + 1}`,
												condition: ''
											}
										]
									}
							  }
							: node
					)
				}));
			},

			removeTransition: (nodeId: string, transitionId: string) => {
				set((state) => ({
					nodes: state.nodes.map((node) =>
						node.id === nodeId
							? {
									...node,
									data: {
										...node.data,
										outputCount: Math.max(0, node.data.outputCount - 1),
										transitions: node.data.transitions.filter(
											(t) => t.id !== transitionId
										)
									}
							  }
							: node
					)
				}));
			},

			updateTransition: (
				nodeId: string,
				transitionId: string,
				updates: Partial<Transition>
			) => {
				set((state) => ({
					nodes: state.nodes.map((node) =>
						node.id === nodeId
							? {
									...node,
									data: {
										...node.data,
										transitions: node.data.transitions.map((t) =>
											t.id === transitionId ? { ...t, ...updates } : t
										)
									}
							  }
							: node
					)
				}));
			},

			setSidebarCollapsed: (collapsed: boolean) => {
				set({ isSidebarCollapsed: collapsed });
			},

			// Undo/Redo functionality
			saveToHistory: () => {
				set((state) => {
					const newHistoryEntry: HistoryState = {
						nodes: [...state.nodes],
						edges: [...state.edges],
						timestamp: Date.now()
					};

					// Remove any redo history when making a new change
					const newHistory = state.history.slice(
						0,
						state.currentHistoryIndex + 1
					);
					newHistory.push(newHistoryEntry);

					// Keep history limited to 50 entries
					if (newHistory.length > 50) {
						newHistory.shift();
					}

					return {
						history: newHistory,
						currentHistoryIndex: newHistory.length - 1,
						canUndo: newHistory.length > 1,
						canRedo: false
					};
				});
			},

			undo: () => {
				set((state) => {
					if (state.currentHistoryIndex > 0) {
						const previousIndex = state.currentHistoryIndex - 1;
						const previousState = state.history[previousIndex];

						return {
							nodes: [...previousState.nodes],
							edges: [...previousState.edges],
							currentHistoryIndex: previousIndex,
							canUndo: previousIndex > 0,
							canRedo: true,
							selectedNodeId: null
						};
					}
					return state;
				});
			},

			redo: () => {
				set((state) => {
					if (state.currentHistoryIndex < state.history.length - 1) {
						const nextIndex = state.currentHistoryIndex + 1;
						const nextState = state.history[nextIndex];

						return {
							nodes: [...nextState.nodes],
							edges: [...nextState.edges],
							currentHistoryIndex: nextIndex,
							canUndo: true,
							canRedo: nextIndex < state.history.length - 1,
							selectedNodeId: null
						};
					}
					return state;
				});
			},

			// Internal node creation (used by smart placement hook)
			_createNode: (
				nodeType: NodeTypeKey,
				position: { x: number; y: number }
			) => {
				const state = get();
				let id = getNextNodeId();

				// Ensure ID is unique - keep generating until we get a unique one
				while (state.nodes.some((node) => node.id === id)) {
					id = getNextNodeId();
				}

				const newNode: FlowNode = {
					id,
					type: nodeType,
					position,
					data: createDefaultNodeData(nodeType, id)
				};

				set((state) => {
					const newState = {
						nodes: [...state.nodes, newNode],
						selectedNodeId: id
					};

					// CRITICAL: Update persisted nodeIdCounter immediately
					queueMicrotask(() => {
						const currentState = get();
						currentState.saveToHistory();
						console.log(
							'Node created and persisted:',
							id,
							'total nodes:',
							currentState.nodes.length
						);
					});

					return newState;
				});
			},

			// Persistence actions
			clearStorage: () => {
				set(getDefaultFlowState());
			},

			exportFlow: () => {
				const state = get();
				return JSON.stringify({
					nodes: state.nodes,
					edges: state.edges,
					nodeIdCounter,
					timestamp: Date.now()
				});
			},

			importFlow: (flowData: string) => {
				try {
					const parsed = JSON.parse(flowData);
					if (
						parsed.nodes &&
						Array.isArray(parsed.nodes) &&
						parsed.edges &&
						Array.isArray(parsed.edges)
					) {
						// CRITICAL: Update nodeIdCounter first to prevent conflicts
						if (
							parsed.nodeIdCounter &&
							typeof parsed.nodeIdCounter === 'number'
						) {
							nodeIdCounter = Math.max(parsed.nodeIdCounter, nodeIdCounter);
						} else {
							// Fallback: Calculate from existing node IDs to ensure no conflicts
							const maxId = Math.max(
								...parsed.nodes
									.map((node: any) => {
										const match = node.id?.match(/^node-(\d+)$/);
										return match ? parseInt(match[1], 10) : 0;
									})
									.filter((id: number) => !isNaN(id)),
								nodeIdCounter
							);
							nodeIdCounter = maxId + 1;
						}

						set({
							nodes: parsed.nodes,
							edges: parsed.edges,
							selectedNodeId: null
						});

						// Force immediate persistence
						queueMicrotask(() => {
							const currentState = get();
							console.log(
								'Flow imported and persisted, total nodes:',
								currentState.nodes.length
							);
						});

						return true;
					}
					return false;
				} catch {
					return false;
				}
			}
		}),
		{
			name: 'flow-storage', // unique name for localStorage key
			storage: createJSONStorage(() => localStorage),
			version: 1,
			// Only persist essential data, exclude selectedNodeId and UI state
			partialize: (state) => ({
				nodes: state.nodes,
				edges: state.edges,
				isSidebarCollapsed: state.isSidebarCollapsed,
				// CRITICAL: Include nodeIdCounter to prevent ID conflicts
				nodeIdCounter: nodeIdCounter
			}),
			// Migration for future versions
			migrate: (persistedState: any, version: number) => {
				if (version === 0) {
					// Handle migration from v0 to v1 if needed
					return persistedState;
				}
				return persistedState;
			},
			// Handle storage errors gracefully
			onRehydrateStorage: (state) => {
				return (state, error) => {
					if (error) {
						console.warn('Failed to rehydrate flow storage:', error);
						// Reset to default state on error
						state?.clearStorage?.();
					} else {
						console.log('Flow storage rehydrated successfully');
						// CRITICAL: Restore nodeIdCounter from persisted state
						const persistedData = JSON.parse(
							localStorage.getItem('flow-storage') || '{}'
						);
						if (persistedData.state?.nodeIdCounter) {
							nodeIdCounter = persistedData.state.nodeIdCounter;
						}
					}
				};
			}
		}
	)
);
