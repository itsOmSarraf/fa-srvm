# AI Workflow Assistant

The AI Workflow Assistant is an intelligent chatbot powered by **Google's Gemini AI** that helps users create, modify, and optimize their conversation workflows using natural language instructions.

## Overview

The AI assistant provides conversational workflow building capabilities, allowing users to describe what they want in plain English and receive actionable workflow modifications. It understands the current workflow state and can suggest specific changes or build entire workflow sections.

## Core Features

- **Natural Language Processing**: Understands workflow requirements in plain English
- **Context Awareness**: Analyzes current workflow state and nodes
- **Actionable Suggestions**: Provides specific, implementable workflow actions
- **Predefined Prompts**: Quick-start templates for common workflow patterns
- **Real-time Integration**: Directly modifies workflow without manual intervention
- **Interactive Chat Interface**: Smooth, responsive chat experience

## User Interface

### Floating Chat Button

- **Position**: Fixed bottom-right corner of the canvas
- **Animation**: Smooth scale-in animation with spring physics
- **Visual**: Blue circular button with message icon
- **Accessibility**: Clear visual indicator and hover states

### Chat Dialog

- **Responsive Design**: 396px width, 500px height modal
- **Modern Styling**: Clean white background with subtle shadows
- **Smooth Animations**: Spring-based open/close transitions
- **Mobile Optimized**: Adapts to different screen sizes

## AI Capabilities

### Workflow Understanding

The AI assistant can analyze and understand:

- **Current Node Structure**: All existing nodes and their types
- **Connection Patterns**: How nodes are connected via edges
- **Selected Context**: Currently selected node for targeted modifications
- **Workflow Completeness**: Gaps or improvements in the flow

### Supported Operations

1. **Node Creation**: Add new nodes of any type
2. **Node Modification**: Update existing node properties
3. **Connection Management**: Create or modify node connections
4. **Workflow Templates**: Generate complete workflow sections
5. **Best Practices**: Suggest optimizations and improvements

### Predefined Prompts

The assistant includes starter prompts for common scenarios:

```typescript
const PREDEFINED_PROMPTS = [
	'Add a customer service workflow that greets users and offers to transfer to sales or support',
	'Create a feedback collection system that asks for rating (1-5) and captures comments',
	'Build a main menu that lets users press 1 for billing, 2 for tech support, or 0 for operator'
];
```

## Technical Implementation

### Main Component

The AI assistant is implemented in `AIWorkflowChat.tsx` with full integration into the canvas ecosystem.

```tsx
// src/components/canvas/AIWorkflowChat.tsx
export function AIWorkflowChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

	// Integration with workflow state
	const nodes = useFlowStore((state) => state.nodes);
	const edges = useFlowStore((state) => state.edges);
	const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
}
```

### AI Chat Integration

Uses the **Vercel AI SDK** for streamlined chat functionality:

```tsx
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat(
	{
		api: '/api/chat'
	}
);
```

### Context-Aware Requests

Each request includes current workflow state for intelligent responses:

```tsx
const handleSubmitWithFlowState = useCallback(
	(e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim()) return;

		handleSubmit(e, {
			body: {
				flowState: {
					nodes,
					edges,
					selectedNodeId
				}
			}
		});
	},
	[handleSubmit, input, nodes, edges, selectedNodeId]
);
```

### Response Processing

AI responses are parsed to extract actionable workflow modifications:

```tsx
const parseAIResponse = useCallback((content: string) => {
	try {
		const humanExplanationMatch = content.match(
			/HUMAN_EXPLANATION:\s*([\s\S]*?)(?=ACTIONS:|$)/
		);
		const actionsMatch = content.match(/ACTIONS:\s*([\s\S]*?)$/);

		if (humanExplanationMatch && actionsMatch) {
			const explanation = humanExplanationMatch[1].trim();
			const actionsText = actionsMatch[1].trim();
			const actions = JSON.parse(actionsText) as WorkflowAction[];

			return { explanation, actions };
		}
	} catch (error) {
		console.warn('Failed to parse AI response for actions:', error);
	}
	return null;
}, []);
```

## Workflow Action System

### Action Types

The AI can generate various workflow actions:

```typescript
interface WorkflowAction {
	type: 'CREATE_NODE' | 'UPDATE_NODE' | 'CONNECT_NODES' | 'DELETE_NODE';
	nodeId?: string;
	nodeType?: NodeTypeKey;
	position?: { x: number; y: number };
	properties?: Record<string, any>;
	sourceId?: string;
	targetId?: string;
}
```

### Action Handler

The `WorkflowActionHandler` component processes and applies AI-generated actions:

- **Preview**: Shows what changes will be made
- **Confirmation**: User can accept or reject suggestions
- **Batch Processing**: Multiple actions applied atomically
- **Error Handling**: Graceful failure recovery

### State Integration

Actions directly integrate with the Zustand store:

```tsx
const { _createNode, updateNode, onConnect, addTransition } = useFlowStore();

const handleCreateNode = useCallback(
	(nodeType: NodeTypeKey, position: { x: number; y: number }) => {
		_createNode(nodeType, position);
	},
	[_createNode]
);
```

## API Integration

### Chat Endpoint

The AI assistant communicates with `/api/chat` endpoint:

- **Framework**: Vercel AI SDK with Google Gemini
- **Streaming**: Real-time response streaming
- **Error Handling**: Graceful degradation and user feedback
- **Rate Limiting**: Built-in request throttling

### Prompt Engineering

The AI is prompted with workflow-specific context:

- **System Role**: Understanding of conversation workflow patterns
- **Current State**: Complete workflow analysis
- **Output Format**: Structured response with actions
- **Best Practices**: Workflow design principles

## User Experience

### Onboarding Flow

1. **Discovery**: Floating button with clear visual cues
2. **Introduction**: Welcome message explaining capabilities
3. **Quick Start**: Predefined prompts for immediate value
4. **Natural Interaction**: Conversational interface

### Message Types

- **User Messages**: Clean blue bubbles, right-aligned
- **AI Responses**: Gray bubbles with parsed content
- **Action Previews**: Special UI for workflow modifications
- **Loading States**: Visual feedback during processing

### Action Workflow

1. **User Request**: Natural language workflow description
2. **AI Analysis**: Context-aware response generation
3. **Action Preview**: Clear explanation of proposed changes
4. **User Confirmation**: Accept, reject, or modify suggestions
5. **Implementation**: Automatic workflow updates

## Advanced Features

### Smart Context

- **Node Selection**: Provides targeted help for selected nodes
- **Workflow Analysis**: Identifies improvement opportunities
- **Pattern Recognition**: Suggests best practices and conventions
- **Error Prevention**: Warns about potential workflow issues

### Conversation Memory

- **Session Persistence**: Maintains context throughout session
- **Applied Changes**: Tracks what modifications were made
- **User Preferences**: Learns from user acceptance patterns

### Integration Points

- **Sidebar Integration**: Works with node configuration panels
- **Canvas Integration**: Updates visible immediately
- **State Synchronization**: Maintains consistency across components

## Configuration

### Environment Setup

```env
# Required for AI functionality
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Customization Options

- **Predefined Prompts**: Easily customizable starter templates
- **Response Styling**: Configurable message appearance
- **Action Types**: Extensible action system
- **UI Positioning**: Flexible placement options

## Error Handling

### Network Issues

- **Graceful Degradation**: Clear error messages
- **Retry Logic**: Automatic retry with exponential backoff
- **Offline Support**: Cached responses when possible

### AI Response Issues

- **Parsing Errors**: Fallback to plain text display
- **Invalid Actions**: Validation and user warnings
- **Rate Limiting**: Appropriate user feedback

## Performance Optimization

- **Lazy Loading**: Chat interface loads on demand
- **Message Virtualization**: Efficient rendering for long conversations
- **State Memoization**: Prevents unnecessary re-renders
- **Debounced Input**: Optimizes API call frequency

## Dependencies

- **ai**: Vercel AI SDK for chat functionality
- **@ai-sdk/google**: Google Gemini integration
- **framer-motion**: Smooth animations and transitions
- **zustand**: State management integration

The AI Workflow Assistant transforms workflow creation from a technical task into a conversational experience, making the platform accessible to users of all technical backgrounds while providing powerful automation for expert users.
