# Node Creation

This document outlines the node creation features in the flow editor.

## Features

### 툴바 Quick Add Toolbar

- **Floating Toolbar**: A convenient toolbar appears when the main sidebar is collapsed.
- **Draggable Interface**: The toolbar can be moved and positioned anywhere on the canvas for easy access.
- **One-Click Node Creation**: Add pre-configured node types to the canvas with a single click.
- **Keyboard Shortcuts**: Use keyboard shortcuts (`C`, `F`, `T`, `D`, `E`) to quickly add nodes.

### Node Types

The following node types can be created:

| Node Type         | Icon      | Description                           | Shortcut |
| ----------------- | --------- | ------------------------------------- | -------- |
| **Conversation**  | `Hash`    | Represents a conversational step.     | `C`      |
| **Function**      | `Cog`     | Executes a custom function.           | `F`      |
| **Call Transfer** | `Phone`   | Transfers the call to another number. | `T`      |
| **Press Digit**   | `Grid3X3` | Simulates a user pressing a digit.    | `D`      |
| **End Call**      | `Square`  | Terminates the current call.          | `E`      |

## Technical Implementation

### React Component

The `NodeCreationToolbar` component manages the state and rendering of the toolbar.

```tsx
// src/components/canvas/NodeCreationToolbar.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
	Hash,
	Cog,
	Phone,
	Grid3X3,
	Square,
	Plus,
	GripVertical
} from 'lucide-react';
import { useFlowStore, NodeTypeKey } from '@/stores/flowStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// ... component implementation
```

### State Management

- **Zustand**: The `useFlowStore` is used to add nodes to the central flow state.
- **Local State**: Component-level state (`useState`) manages the toolbar's position, visibility, and drag state.

### Animation

- **Framer Motion**: Used for smooth animations when the toolbar appears, disappears, and is being dragged.

## Usage

### Showing the Toolbar

1.  Collapse the main sidebar on the left.
2.  The "Quick Add" toolbar will automatically appear on the canvas.

### Adding Nodes

- **Click**: Click on any of the node icons in the toolbar to add a new node of that type to the center of the canvas.
- **Keyboard**: Press the corresponding shortcut key to add a node. A hint will appear to confirm the action.

### Repositioning the Toolbar

1.  Click and hold the drag handle (`GripVertical` icon) on the toolbar.
2.  Drag the toolbar to the desired position on the canvas.
3.  Release the mouse button to set the new position.

The toolbar will intelligently stay within the visible bounds of the canvas, avoiding sidebars.

## Future Enhancements

- **Customizable Toolbar**: Allow users to add or remove node types from the toolbar.
- **Drag-and-Drop Creation**: Drag a node type from the toolbar directly onto the canvas to create it at a specific position.
- **Node Templates**: Create nodes from pre-defined templates.
