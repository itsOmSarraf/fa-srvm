# Custom Nodes and Edges

This document details the architecture for custom nodes and edges within the flow editor, powered by React Flow.

## Custom Nodes

Our nodes are built on a modular and reusable system. A `BaseNode` component provides the common structure and functionality, which is then extended by specific node types.

### Base Node (`BaseNode.tsx`)

This is the foundational component for all nodes in the flow.

**Key Features**:

- **Consistent Structure**: Provides a standard layout with a header, content area, and output section.
- **Editable Labels**: Node titles can be edited directly on the node with a double-click.
- **Theming**: Accepts a `colorTheme` prop to style the node's appearance (icon, background, border).
- **Dynamic Handles**: Automatically renders a single input (target) handle on the left and a variable number of output (source) handles on the right based on the node's `outputCount` data.
- **Content Injection**: A `renderContent` prop allows specific node types to inject their unique UI and logic.

```tsx
// src/components/canvas/nodes/BaseNode.tsx
<BaseNode
    {...props}
    icon={MessageSquare}
    colorTheme={nodeThemes.conversation}
    renderContent={(nodeData) => (
        // JSX for the node's specific content
    )}
/>
```

### Specific Node Types

Each node type (e.g., `ConversationNode`, `FunctionNode`) is a small React component that wraps `BaseNode`. Its role is to provide the unique details for that node type.

**Example: `ConversationNode.tsx`**

```tsx
// src/components/canvas/nodes/NewNodes/ConversationNode.tsx
import { BaseNode } from '../BaseNode';
import { nodeThemes } from './nodeThemes';
import { Hash } from 'lucide-react';

export const ConversationNode: React.FC<NodeProps> = (props) => {
	// Defines the unique content for this node type
	const renderContent = (nodeData: NodeConfig) => (
		<div className='text-sm text-gray-600'>
			{nodeData.prompt?.substring(0, 50) || 'No prompt set'}...
		</div>
	);

	return (
		<BaseNode
			{...props}
			icon={Hash}
			colorTheme={nodeThemes.conversation}
			renderContent={renderContent}
		/>
	);
};
```

This architecture makes it very easy to create new node types with a consistent look and feel.

---

## Custom Edges

Edges are the connections between nodes. We use a custom edge component to provide a better user experience.

### `CustomEdge.tsx`

This component controls the appearance and behavior of all connections.

**Key Features**:

- **Smooth Paths**: Uses `getSmoothStepPath` to draw clean, curved lines between nodes.
- **Easy Deletion**: An inline delete button (`X`) appears in the middle of an edge when it's selected or hovered over, allowing for quick removal.
- **Visual Feedback**: Edges change color when selected, making it clear which connection is active.
- **Centralized Logic**: All edge-related functionality is managed in this single component.

```tsx
// src/components/canvas/edges/CustomEdge.tsx
export const CustomEdge: React.FC<EdgeProps> = ({ id, ...props }) => {
    const { deleteEdge } = useFlowStore();
    const [edgePath, labelX, labelY] = getSmoothStepPath(props);

    return (
        <>
            <path d={edgePath} ... />
            <EdgeLabelRenderer>
                <button onClick={() => deleteEdge(id)}>...</button>
            </EdgeLabelRenderer>
        </>
    );
};
```

This setup provides an intuitive and visually appealing way to manage the relationships between nodes in the flow.
