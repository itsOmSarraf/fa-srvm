import { CustomNode } from '../nodes/NewNodes/CustomNode';
import { ConversationNode } from '../nodes/NewNodes/ConversationNode';
import { FunctionNode } from '../nodes/NewNodes/FunctionNode';
import { CallTransferNode } from '../nodes/NewNodes/CallTransferNode';
import { PressDigitNode } from '../nodes/NewNodes/PressDigitNode';
import { EndCallNode } from '../nodes/NewNodes/EndCallNode';

export const nodeTypes = {
	customNode: CustomNode,
	conversation: ConversationNode,
	function: FunctionNode,
	callTransfer: CallTransferNode,
	pressDigit: PressDigitNode,
	endCall: EndCallNode
};

export type NodeType = keyof typeof nodeTypes;
