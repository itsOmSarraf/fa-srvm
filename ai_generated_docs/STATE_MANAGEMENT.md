# State Management with Zustand

The entire state of the flow editor application is managed by a single, centralized store created with **Zustand**. This approach simplifies state management, ensures data consistency, and provides a clear and predictable way to update the application's state.

The store is defined in `src/stores/flowStore.ts`.

## Core Concepts

- **Single Source of Truth**: All application data—nodes, edges, UI state (like sidebar visibility), and selected elements—resides in one place. This eliminates confusion about where data comes from and how it's updated.
- **Actions**: The state is immutable and can only be modified by calling pre-defined **actions** (e.g., `addNode`, `updateNode`). This ensures that all state changes are explicit and traceable.
- **Selectors**: Components subscribe to specific pieces of the state. Zustand ensures that a component only re-renders when the exact piece of state it's subscribed to changes, leading to highly optimized performance.

## State Structure (`FlowState`)

The main state interface defines the shape of our store.

```ts
// src/stores/flowStore.ts
interface FlowState {
	nodes: FlowNode[];
	edges: Edge[];
	selectedNodeId: string | null;
	isSidebarCollapsed: boolean;

	// Actions
	addNode: (nodeType: NodeTypeKey, position: { x: number; y: number }) => void;
	updateNode: (nodeId: string, data: Partial<NodeConfig>) => void;
	// ... many other actions
}
```

- `nodes`: An array of all nodes on the canvas.
- `edges`: An array of all connections between nodes.
- `selectedNodeId`: The ID of the currently selected node, which drives the right sidebar's visibility and content.
- `isSidebarCollapsed`: A boolean to control the collapsed state of the left sidebar.

## Persistence

- **Zustand Persist Middleware**: The store uses the `persist` middleware to automatically save the entire state to the browser's **Local Storage**.
- **Automatic Hydration**: When the application loads, the store is automatically "hydrated" with the saved state, allowing users to pick up exactly where they left off.
- **Persistence Controls**: The store includes actions like `exportFlow`, `importFlow`, and `clearStorage` that are used by the `PersistenceControls` component to manage this stored data.

```ts
// src/stores/flowStore.ts
export const useFlowStore = create<FlowState>()(
	persist(
		(set, get) => ({
			// ... state and actions ...
		}),
		{
			name: 'flow-storage', // The key used in Local Storage
			storage: createJSONStorage(() => localStorage)
		}
	)
);
```

## Usage in Components

Components access the store via the `useFlowStore` hook. They can select specific state slices and actions.

```tsx
// Example from NodeConfigPanel.tsx
import { useFlowStore } from '@/stores/flowStore';

const NodeConfigPanel = () => {
	// Select specific data and actions from the store
	const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
	const updateNode = useFlowStore((state) => state.updateNode);
	const node = useFlowStore((state) =>
		state.nodes.find((n) => n.id === selectedNodeId)
	);

	const handleUpdate = (field: keyof NodeConfig, value: any) => {
		// Call an action to update the state
		updateNode(selectedNodeId, { [field]: value });
	};

	// ...
};
```

This clean, hook-based API makes components declarative and easy to reason about. All complex logic is encapsulated within the store's actions, keeping the components focused on rendering the UI.
