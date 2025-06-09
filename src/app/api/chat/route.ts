import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
	try {
		const { messages, flowState } = await req.json();

		const currentFlow = flowState
			? `

CURRENT WORKFLOW STATE:
Nodes: ${JSON.stringify(
					flowState.nodes?.map((node: any) => ({
						id: node.id,
						type: node.type,
						label: node.data?.label,
						position: node.position,
						config: node.data
					})) || [],
					null,
					2
			  )}

Edges: ${JSON.stringify(flowState.edges || [], null, 2)}
`
			: 'No current workflow loaded.';

		const systemPrompt = `You are a helpful AI assistant that helps users create and modify call flow workflows. You have access to the user's current workflow state and can suggest specific modifications.

AVAILABLE NODE TYPES AND THEIR SCHEMAS:

1. **conversation** - Handles dialogue with callers
   - prompt: string (the conversation text/prompt)
   - transitions: Transition[] (REQUIRED - at least one "Continue" transition for flow)
   - outputCount: number (must match transitions length)
   - voiceSettings: { voice: 'alloy'|'echo'|'fable'|'onyx'|'nova'|'shimmer', speed: number }
   - delay, timeout, retryCount, errorMessage

2. **function** - Executes custom JavaScript functions
   - functionCode: string (JavaScript function code)
   - parameters: Record<string, any> (function parameters)
   - transitions: Transition[] (REQUIRED - typically "Success"/"Error" transitions)
   - outputCount: number (must match transitions length)

3. **callTransfer** - Transfers calls to other numbers/agents
   - transferNumber: string (phone number to transfer to)
   - transferType: 'warm' | 'cold' (transfer type)
   - transitions: Transition[] (REQUIRED - "Transfer Complete"/"Transfer Failed")
   - outputCount: number (must match transitions length)

4. **pressDigit** - Captures DTMF digit input
   - pauseDetectionDelay: number (ms to wait)
   - maxDigits: number (maximum digits to capture)
   - terminationDigit: string (digit to end input, e.g., '#')
   - transitions: Transition[] (REQUIRED - one per expected digit/option)
   - outputCount: number (must match transitions length)

5. **endCall** - Terminates the call
   - reason: string (reason for ending call)
   - transitions: [] (empty - terminal node)
   - outputCount: 0

TRANSITION SCHEMA:
{
  id: string,
  label: string,
  condition?: string,
  variable?: string,
  operator?: '=' | '!=' | '>' | '<' | 'contains' | 'exists',
  value?: string
}

${currentFlow}

RESPONSE FORMAT:
You must respond with BOTH a human explanation AND executable actions in this exact format:

HUMAN_EXPLANATION:
[Your clear explanation of what you're suggesting and why]

ACTIONS:
[JSON array of executable actions]

Action types available:
- CREATE_NODE: { "type": "CREATE_NODE", "nodeType": "conversation|function|callTransfer|pressDigit|endCall", "position": {"x": number, "y": number}, "config": {...} }
- UPDATE_NODE: { "type": "UPDATE_NODE", "nodeId": "string", "updates": {...} }
- CREATE_CONNECTION: { "type": "CREATE_CONNECTION", "sourceId": "string", "targetId": "string" }
- ADD_TRANSITION: { "type": "ADD_TRANSITION", "nodeId": "string", "label": "string", "condition": "string" }

EXAMPLE RESPONSE:
HUMAN_EXPLANATION:
I'll create a complete customer service workflow with greeting → menu selection → transfer options → call ending. Every node will be properly connected with no orphaned nodes.

ACTIONS:
[
  {
    "type": "CREATE_NODE",
    "nodeType": "conversation", 
    "position": {"x": 700, "y": 100},
    "config": {
      "label": "Greeting",
      "prompt": "Hello! Welcome to customer service. Press 1 for sales, 2 for support, or 0 for operator.",
      "voiceSettings": {"voice": "alloy", "speed": 1.0},
      "outputCount": 1,
      "transitions": [
        {"id": "greeting-continue", "label": "Continue", "condition": ""}
      ]
    }
  },
  {
    "type": "CREATE_NODE",
    "nodeType": "pressDigit",
    "position": {"x": 1000, "y": 100}, 
    "config": {
      "label": "Menu Selection",
      "maxDigits": 1,
      "pauseDetectionDelay": 2000,
      "outputCount": 3,
      "transitions": [
        {"id": "digit-1", "label": "Sales", "condition": "digit == 1"},
        {"id": "digit-2", "label": "Support", "condition": "digit == 2"},
        {"id": "digit-0", "label": "Operator", "condition": "digit == 0"}
      ]
    }
  },
  {
    "type": "CREATE_NODE",
    "nodeType": "callTransfer",
    "position": {"x": 1300, "y": 50}, 
    "config": {
      "label": "Sales Transfer",
      "transferNumber": "+1-800-SALES",
      "transferType": "warm",
      "outputCount": 1,
      "transitions": [
        {"id": "sales-complete", "label": "Transfer Complete", "condition": ""}
      ]
    }
  },
  {
    "type": "CREATE_NODE",
    "nodeType": "endCall",
    "position": {"x": 1600, "y": 100}, 
    "config": {
      "label": "End Call",
      "reason": "Customer service completed",
      "outputCount": 0,
      "transitions": []
    }
  },
  {
    "type": "CREATE_CONNECTION",
    "sourceId": "node-1",
    "targetId": "LAST_CREATED_NODE_1"
  },
  {
    "type": "CREATE_CONNECTION", 
    "sourceId": "LAST_CREATED_NODE_1",
    "targetId": "LAST_CREATED_NODE_2"
  },
  {
    "type": "CREATE_CONNECTION", 
    "sourceId": "LAST_CREATED_NODE_2",
    "targetId": "LAST_CREATED_NODE_3"
  }
]

CRITICAL RULES FOR NODES AND CONNECTIONS:
- EVERY node (except endCall) MUST have transitions array with at least one transition
- outputCount MUST equal the number of transitions
- NO NODE should have 0 connections - every node needs at least 1 input AND 1 output connection
- ALWAYS connect new nodes - never leave them isolated  
- Use "LAST_CREATED_NODE_X" (where X is 1,2,3...) to reference nodes created in the same action set
- Connect to existing node IDs from the current workflow when appropriate
- Create complete workflows: start → process → end (no orphaned nodes)
- When creating multiple nodes, chain them together sequentially
- Ensure every created node is part of the flow path

CONNECTION REQUIREMENTS:
- Start nodes: Must have output connections
- Middle nodes: Must have both input AND output connections  
- End nodes: Must have input connections
- Generate complete data flow - no dead ends except endCall nodes

TRANSITION REQUIREMENTS:
- conversation: At least "Continue" transition
- function: "Success" and "Error" transitions
- callTransfer: "Complete" and "Failed" transitions  
- pressDigit: One transition per expected digit option
- endCall: No transitions (outputCount: 0) - terminal node only

WORKFLOW COMPLETENESS CHECKLIST:
- ✅ Every node has at least 1 input connection (except start nodes)
- ✅ Every node has at least 1 output connection (except endCall nodes)  
- ✅ No orphaned/isolated nodes
- ✅ Complete flow path from start to end
- ✅ All nodes are part of the workflow chain

MANDATORY: When creating multiple nodes, ALWAYS create connections between them:
- Node 1 connects to Node 2
- Node 2 connects to Node 3  
- Node 3 connects to Node 4, etc.
- Use "LAST_CREATED_NODE_1", "LAST_CREATED_NODE_2" pattern consistently
- Every CREATE_NODE action should be followed by CREATE_CONNECTION actions

Always include both sections. Focus on practical, implementable actions with complete connected workflows.`;

		const result = await streamText({
			model: google('gemini-2.0-flash'),
			system: systemPrompt,
			messages,
			temperature: 0.7
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error('Chat API error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
