# State Management with Zustand

The application uses **Zustand** for state management, providing a simple and efficient way to manage global application state.

## Why Zustand?

- **Simplicity**: Minimal boilerplate compared to Redux
- **TypeScript Support**: Excellent TypeScript integration out of the box
- **Performance**: Uses React's state primitives for efficient updates
- **Immutability**: The state is immutable and can only be modified by calling pre-defined **actions** (e.g., `updateNode`). This ensures that all state changes are explicit and traceable.
- **Persistence**: Built-in support for localStorage persistence with automatic rehydration

## Flow Store Structure

The main store (`useFlowStore`) manages the canvas flow state:

### State Properties

- `nodes`: Array of flow nodes
- `edges`: Array of connections between nodes
- `selectedNodeId`: Currently selected node
- `isSidebarCollapsed`: UI state for sidebar

### Actions

- `updateNode`: Update node properties
- `selectNode`: Select/deselect nodes
- `setNodes`/`setEdges`: Batch updates
- `onConnect`: Handle edge connections
- `deleteNode`/`deleteEdge`: Remove elements
- `addTransition`/`removeTransition`: Manage node transitions
- `setSidebarCollapsed`: Toggle sidebar state

### Smart Node Creation

Node creation is handled by the `useSmartNodePlacement` hook which provides intelligent positioning based on existing nodes.
