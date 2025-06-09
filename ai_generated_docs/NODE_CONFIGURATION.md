# Node Configuration

The Node Configuration panel is the primary interface for defining the behavior and properties of each node in the flow. It appears in the **Right Sidebar** whenever a node is selected on the canvas.

## Overview

The panel is context-aware, meaning it displays different options based on the type of node that is currently selected. It's built as a single, powerful component: `NodeConfigPanel.tsx`.

## Common Features

All nodes share a common set of configurable features, accessible via tabs at the top of the panel.

### Node-Specific Config (Config Tab)

This is the default tab, showing settings unique to the selected node's type.

- **Conversation Node**: A textarea for the `prompt` that the AI will use.
- **Function Node**: Fields for `Function Name` and `Parameters`.
- **Call Transfer Node**: An input for the `Phone Number` to transfer to.
- **Press Digit Node**: An input for the `Digits` to be sent.
- **End Call Node**: A confirmation message.

### Global Settings (Global Tab)

This tab contains advanced settings that are common across most node types.

- **Timing**: Configure execution `delay` and `timeout` values in milliseconds.
- **Audio Settings**: Adjust the `Voice Type` (e.g., Alloy, Onyx) and `Speech Speed`.
- **Advanced Options**: Set the number of `Retry Attempts` on failure and a custom `Error Message`.

### Transitions

At the bottom of the "Config" tab, the **Transitions** section allows you to manage the node's outputs.

- **Dynamic Outputs**: Add or remove transitions, which correspond directly to the output handles on the node itself.
- **Custom Labels**: Each transition can be given a descriptive label (e.g., "If user says yes", "On failure") to clarify the flow's logic. This label appears next to the corresponding output handle on the node.

### Delete Node

A "Delete Node" button is available at the very bottom of the panel to remove the selected node from the flow.

## Technical Implementation

### Centralized Component (`NodeConfigPanel.tsx`)

All configuration UI is managed within this single component. A `switch` statement based on the selected node's `data.type` is used to render the correct set of fields.

```tsx
// src/components/canvas/config/NodeConfigPanel.tsx

const renderConfigFields = () => {
    const { data } = selectedNode;

    switch (data.type) {
        case 'conversation':
            return (/* ... conversation fields ... */);
        case 'function':
            return (/* ... function fields ... */);
        // ... other cases
        default:
            return <div>This node has no specific configuration.</div>;
    }
};
```

### State Management

- The panel is deeply integrated with the `useFlowStore` (Zustand) store.
- It reads the data for the `selectedNodeId`.
- Every input change immediately calls an update function (e.g., `updateNode`, `updateTransition`) to modify the state in the central store. This ensures that all changes are instantly reflected and persisted.

```tsx
// Example: Updating a node's prompt
<Textarea
    id="prompt"
    value={data.prompt || ''}
    onChange={(e) => updateNode(selectedNodeId, { prompt: e.target.value })}
/>

// Example: Updating a transition's label
<Input
    value={transition.label}
    onChange={(e) => updateTransition(transition.id, { label: e.target.value })}
/>
```

This direct-to-store update pattern simplifies state management and ensures data consistency across the application.
