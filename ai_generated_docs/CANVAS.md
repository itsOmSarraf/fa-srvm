# The Canvas

The Canvas is the central workspace of the flow editor, where you build and interact with your flow diagrams. It is built using the powerful **React Flow** library.

## Core Features

- **Interactive Workspace**: A pannable and zoomable infinite canvas for designing complex flows.
- **Grid Background**: A dotted grid background helps with the alignment and organization of nodes.
- **Node & Edge Rendering**: Renders all custom nodes and edges, providing a clear visual representation of the flow logic.
- **Selection Handling**: Click to select nodes and edges. Selected elements are highlighted for clarity.
- **Multi-Selection**: Hold `Ctrl` or `Cmd` to select and manipulate multiple nodes at once.
- **Deletion**: Selected nodes or edges can be deleted using the `Backspace` or `Delete` key.

## Interactions

- **Connecting Nodes**: Drag from an output handle (right side) of one node to an input handle (left side) of another to create a connection (edge).
- **Node Selection**: Click a node to select it. This will also open the **Right Sidebar** with its configuration options.
- **Deselection**: Click on the canvas background to deselect any active node.
- **Drag and Drop Creation**: Drag a node from the **Left Sidebar** and drop it onto the canvas to create it at that specific position.

## Technical Implementation

The main component for the canvas is `Playground.tsx`.

### State Management

- **Dual State Model**: The component uses both React Flow's internal state hooks (`useNodesState`, `useEdgesState`) and our global Zustand store (`useFlowStore`).
- **Synchronization**: `useEffect` hooks are used to keep the two state models in sync. This provides the performance benefits of React Flow's internal state while maintaining a centralized, persistent state in Zustand.

```tsx
// src/components/canvas/Playground.tsx

// React Flow's internal state for smooth UI updates
const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

// Sync with global Zustand store
React.useEffect(() => {
	setFlowNodes(nodes); // Zustand -> React Flow
}, [nodes, setFlowNodes]);

React.useEffect(() => {
	setNodes(flowNodes); // React Flow -> Zustand
}, [flowNodes, setNodes]);
```

### React Flow Configuration

The `<ReactFlow />` component is configured with all our custom components and event handlers.

```tsx
// src/components/canvas/Playground.tsx
<ReactFlow
	nodes={nodesWithSelection}
	edges={flowEdges}
	onNodesChange={onNodesChange}
	onEdgesChange={onEdgesChange}
	onConnect={onConnect}
	onDrop={onDrop}
	nodeTypes={nodeTypes} // Custom node components
	edgeTypes={edgeTypes} // Custom edge components
	fitView
	onPaneClick={onPaneClick}>
	<Background />
	<NodeCreationToolbar />
</ReactFlow>
```

### Custom Styling

- Custom CSS is injected via a `<style>` tag to enhance the default React Flow styles, such as making edges thicker and ensuring handle sizes are consistent with our `BaseNode` design.
