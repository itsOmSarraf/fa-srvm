import { type Node } from '@xyflow/react';
import { type CustomNodeData } from '../nodes';

export const createNode = (
	id: string,
	label: string,
	position: { x: number; y: number },
	outputCount: number = 1
): Node<CustomNodeData> => ({
	id,
	position,
	data: { label, outputCount },
	type: 'customNode'
});

export const updateNodeOutputCount = (
	nodes: Node<CustomNodeData>[],
	nodeId: string,
	newOutputCount: number
): Node<CustomNodeData>[] => {
	return nodes.map((node) =>
		node.id === nodeId
			? {
					...node,
					data: {
						...node.data,
						outputCount: newOutputCount
					}
			  }
			: node
	);
};

export const getOutputHandleId = (index: number): string => `output-${index}`;
