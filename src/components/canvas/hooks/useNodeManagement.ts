import { useCallback } from 'react';
import {
	useNodesState,
	useEdgesState,
	addEdge,
	type Connection,
	type Node,
	type Edge
} from '@xyflow/react';
import { type CustomNodeData } from '../utils';

export const useNodeManagement = (
	initialNodes: Node<CustomNodeData>[],
	initialEdges: Edge[]
) => {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
		console.log('Node clicked:', node.data?.label || node.id);
	}, []);

	const updateNodeData = useCallback(
		(nodeId: string, newData: Partial<CustomNodeData>) => {
			setNodes((nds) =>
				nds.map((node) =>
					node.id === nodeId
						? { ...node, data: { ...node.data, ...newData } }
						: node
				)
			);
		},
		[setNodes]
	);

	return {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onNodeClick,
		updateNodeData
	};
};
