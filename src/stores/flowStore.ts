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
				prompt: 'Enter your conversation prompt here...'
			};
		case 'function':
			return {
				...baseData,
				label: 'Function',
				functionCode:
					'function execute() {\n  // Your code here\n  return true;\n}',
				parameters: {}
			};
		case 'callTransfer':
			return {
				...baseData,
				label: 'Call Transfer',
				transferNumber: '',
				transferType: 'warm'
			};
		case 'pressDigit':
			return {
				...baseData,
				label: 'Press Digit',
				pauseDetectionDelay: 2000,
				maxDigits: 1,
				terminationDigit: '#'
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

let nodeIdCounter = 1;

// Export function to get next node ID
export const getNextNodeId = () => `node-${++nodeIdCounter}`;

interface FlowState {
	nodes: FlowNode[];
	edges: Edge[];
	selectedNodeId: string | null;
	isSidebarCollapsed: boolean;

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
	// Persistence actions
	clearStorage: () => void;
	exportFlow: () => string;
	importFlow: (flowData: string) => boolean;
}

// Default flow state for initialization and reset
const getDefaultFlowState = () => ({
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
	isSidebarCollapsed: false
});

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
				set((state) => ({
					nodes: state.nodes.filter((node) => node.id !== nodeId),
					edges: state.edges.filter(
						(edge) => edge.source !== nodeId && edge.target !== nodeId
					),
					selectedNodeId:
						state.selectedNodeId === nodeId ? null : state.selectedNodeId
				}));
			},

			deleteEdge: (edgeId: string) => {
				set((state) => ({
					edges: state.edges.filter((edge) => edge.id !== edgeId)
				}));
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

			// Internal node creation (used by smart placement hook)
			_createNode: (
				nodeType: NodeTypeKey,
				position: { x: number; y: number }
			) => {
				const id = getNextNodeId();
				const newNode: FlowNode = {
					id,
					type: nodeType,
					position,
					data: createDefaultNodeData(nodeType, id)
				};

				set((state) => ({
					nodes: [...state.nodes, newNode],
					selectedNodeId: id
				}));
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
						set({
							nodes: parsed.nodes,
							edges: parsed.edges,
							selectedNodeId: null
						});
						if (parsed.nodeIdCounter) {
							nodeIdCounter = parsed.nodeIdCounter;
						}
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
				isSidebarCollapsed: state.isSidebarCollapsed
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
					}
				};
			}
		}
	)
);
