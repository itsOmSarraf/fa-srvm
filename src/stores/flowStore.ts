import { create } from 'zustand';
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

export interface NodeConfig extends Record<string, unknown> {
	// Common properties
	id: string;
	label: string;
	type: NodeTypeKey;
	outputCount: number;
	transitions: Transition[];

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

interface FlowState {
	nodes: FlowNode[];
	edges: Edge[];
	selectedNodeId: string | null;

	// Actions
	addNode: (nodeType: NodeTypeKey, position: { x: number; y: number }) => void;
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
}

const createDefaultNodeData = (type: NodeTypeKey, id: string): NodeConfig => {
	const baseData: NodeConfig = {
		id,
		label: '',
		type,
		outputCount: 0,
		transitions: []
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

export const useFlowStore = create<FlowState>((set, get) => ({
	// Initial state with start and end points plus one sample node
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
		},
		{
			id: 'end',
			type: 'output',
			position: { x: 700, y: 100 },
			data: {
				id: 'end',
				label: 'End',
				type: 'endCall' as NodeTypeKey,
				outputCount: 0,
				transitions: []
			},
			draggable: true,
			deletable: false
		}
	],
	edges: [
		{
			id: 'e-start-1',
			source: 'start',
			target: 'node-1'
		},
		{
			id: 'e-1-end',
			source: 'node-1',
			target: 'end'
		}
	],
	selectedNodeId: null,

	addNode: (nodeType: NodeTypeKey, position: { x: number; y: number }) => {
		const id = `node-${++nodeIdCounter}`;
		const newNode: FlowNode = {
			id,
			type: nodeType,
			position,
			data: createDefaultNodeData(nodeType, id)
		};

		set((state) => ({
			nodes: [...state.nodes, newNode]
		}));
	},

	updateNode: (nodeId: string, data: Partial<NodeConfig>) => {
		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
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
	}
}));
