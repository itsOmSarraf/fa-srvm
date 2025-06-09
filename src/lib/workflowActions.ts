import type { NodeTypeKey, NodeConfig, Transition } from '@/stores/flowStore';

export interface WorkflowAction {
	type: 'CREATE_NODE' | 'UPDATE_NODE' | 'CREATE_CONNECTION' | 'ADD_TRANSITION';
	nodeId?: string;
	nodeType?: NodeTypeKey;
	position?: { x: number; y: number };
	config?: Partial<NodeConfig>;
	sourceId?: string;
	targetId?: string;
	transition?: Partial<Transition>;
}

export const createConversationNode = (
	position: { x: number; y: number },
	prompt: string,
	label: string = 'Conversation'
): WorkflowAction => ({
	type: 'CREATE_NODE',
	nodeType: 'conversation',
	position,
	config: {
		label,
		prompt,
		voiceSettings: { voice: 'alloy', speed: 1.0 },
		timeout: 30000
	}
});

export const createPressDigitNode = (
	position: { x: number; y: number },
	maxDigits: number = 1,
	label: string = 'Press Digit'
): WorkflowAction => ({
	type: 'CREATE_NODE',
	nodeType: 'pressDigit',
	position,
	config: {
		label,
		maxDigits,
		pauseDetectionDelay: 2000,
		terminationDigit: '#'
	}
});

export const createCallTransferNode = (
	position: { x: number; y: number },
	transferNumber: string,
	transferType: 'warm' | 'cold' = 'warm',
	label: string = 'Call Transfer'
): WorkflowAction => ({
	type: 'CREATE_NODE',
	nodeType: 'callTransfer',
	position,
	config: {
		label,
		transferNumber,
		transferType
	}
});

export const createFunctionNode = (
	position: { x: number; y: number },
	functionCode: string,
	label: string = 'Function'
): WorkflowAction => ({
	type: 'CREATE_NODE',
	nodeType: 'function',
	position,
	config: {
		label,
		functionCode,
		parameters: {}
	}
});

export const createEndCallNode = (
	position: { x: number; y: number },
	reason: string = 'Conversation completed',
	label: string = 'End Call'
): WorkflowAction => ({
	type: 'CREATE_NODE',
	nodeType: 'endCall',
	position,
	config: {
		label,
		reason,
		outputCount: 0,
		transitions: []
	}
});

export const updateNodeConfig = (
	nodeId: string,
	updates: Partial<NodeConfig>
): WorkflowAction => ({
	type: 'UPDATE_NODE',
	nodeId,
	config: updates
});

export const createConnection = (
	sourceId: string,
	targetId: string
): WorkflowAction => ({
	type: 'CREATE_CONNECTION',
	sourceId,
	targetId
});

export const addTransition = (
	nodeId: string,
	label: string,
	condition?: string
): WorkflowAction => ({
	type: 'ADD_TRANSITION',
	nodeId,
	transition: {
		id: `transition-${Date.now()}`,
		label,
		condition: condition || ''
	}
});

// Helper function to suggest next position based on existing nodes
export const suggestNextPosition = (
	existingNodes: Array<{ position: { x: number; y: number } }>
): { x: number; y: number } => {
	if (existingNodes.length === 0) {
		return { x: 100, y: 100 };
	}

	const maxX = Math.max(...existingNodes.map((node) => node.position.x));
	const avgY =
		existingNodes.reduce((sum, node) => sum + node.position.y, 0) /
		existingNodes.length;

	return { x: maxX + 300, y: Math.round(avgY) };
};
