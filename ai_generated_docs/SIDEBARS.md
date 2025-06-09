# Sidebars

This document describes the left and right sidebars in the flow editor.

## Left Sidebar: Node Palette

The left sidebar serves as the primary tool for adding new nodes to the canvas.

### Features

- **Collapsible**: The sidebar can be expanded to show all available nodes or collapsed to a minimal tab to maximize canvas space.
- **Click to Add**: Click on any node in the list to instantly add it to the canvas at a default position.
- **Drag and Drop**: Drag a node from the sidebar and drop it anywhere on the canvas to create and position it precisely.
- **Informative**: Each node in the list includes an icon, a description, and is color-coded for easy identification.
- **Pro Tips**: Includes helpful hints to improve user workflow.

### Usage

- **Toggle**: Click the `ChevronLeft` icon to collapse the sidebar and the `ChevronRight` icon to expand it.
- **Add Node (Click)**: Click a node item in the sidebar.
- **Add Node (Drag)**: Click and hold a node item, drag it over the canvas, and release the mouse button.

## Right Sidebar: Configuration Panel

The right sidebar is a contextual panel for configuring selected nodes.

### Features

- **Context-Aware**: The sidebar automatically appears when you select a node on the canvas.
- **Node-Specific Forms**: It displays configuration options and settings that are specific to the type of node selected.
- to the type of node selected.
- **Dynamic Content**: The content of the sidebar changes instantly when you select a different node.
- **Auto-Hiding**: The sidebar slides away automatically when no node is selected, providing an unobstructed view of the flow.

### Usage

1.  Click on any node in the flow diagram.
2.  The right sidebar will slide into view from the right edge of the screen.
3.  Modify the node's properties using the controls in the sidebar.
4.  Click on the canvas background or press the `Esc` key to deselect the node and hide the sidebar.

## Technical Implementation

### Components

- `SidebarLeft.tsx`: Manages the node palette and its interactions.
- `SidebarRight.tsx`: Manages the visibility of the node configuration panel.
- `NodeConfigPanel.tsx`: Renders the actual configuration form for a selected node. (This will be documented separately).

### State Management

- `useFlowStore` (Zustand): The central store manages the collapsed state of the left sidebar (`isSidebarCollapsed`) and the currently selected node ID (`selectedNodeId`), which controls the visibility of the right sidebar.

### Animation

- **Framer Motion**: Both sidebars use `framer-motion` for smooth, spring-based animations, enhancing the user experience.

```tsx
// src/components/canvas/SidebarLeft.tsx
<AnimatePresence mode="wait">
    {isSidebarCollapsed ? (
        /* ... collapsed view ... */
    ) : (
        /* ... expanded view ... */
    )}
</AnimatePresence>

// src/components/canvas/SidebarRight.tsx
<AnimatePresence mode="wait">
    {selectedNodeId && (
        /* ... sidebar content ... */
    )}
</AnimatePresence>
```
