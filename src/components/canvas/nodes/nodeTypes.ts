import { CustomNode } from './NewNodes/CustomNode';
import { ConversationNode } from './NewNodes/ConversationNode';
import { FunctionNode } from './NewNodes/FunctionNode';
import { CallTransferNode } from './NewNodes/CallTransferNode';
import { PressDigitNode } from './NewNodes/PressDigitNode';
import { EndCallNode } from './NewNodes/EndCallNode';

export const nodeTypes = {
	customNode: CustomNode,
	conversation: ConversationNode,
	function: FunctionNode,
	callTransfer: CallTransferNode,
	pressDigit: PressDigitNode,
	endCall: EndCallNode
};

export type NodeType = keyof typeof nodeTypes;
