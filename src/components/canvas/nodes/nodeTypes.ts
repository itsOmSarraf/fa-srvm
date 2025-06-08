import { CustomNode } from './CustomNode';

export const nodeTypes = {
	customNode: CustomNode
};

export type NodeType = keyof typeof nodeTypes;
