import { CustomEdge } from './CustomEdge';

export const edgeTypes = {
	default: CustomEdge,
	smoothstep: CustomEdge,
	straight: CustomEdge,
	step: CustomEdge
};

export type EdgeType = keyof typeof edgeTypes;
