# Header

The Header component is located at the top of the flow editor page and provides navigation, information, and key actions.

## Features

### Information Display

- **Flow Title**: Displays the current flow's title. An edit icon suggests the title can be changed.
- **Flow Details**: Shows important metadata about the flow, such as:
  - Agent ID (with a copy button)
  - Conversation Flow ID (with a copy button)
  - Price
  - Estimated Latency
- **Data Source**: This information is currently sourced from a static data object in `lib/canvas-data.ts`.

### Navigation

- **Back Button**: A prominent "back" button (`ChevronLeft` icon) allows users to navigate away from the editor, likely back to a dashboard or home page. It uses Next.js's `<Link>` component for client-side routing.

### Persistence Controls

- **Save Status**: Integrates the `PersistenceStatus` component to show the real-time save state of the flow (e.g., "Saved just now").
- **File Actions**: Integrates the `PersistenceControls` component, providing buttons for **Import**, **Export**, and **Resetting** the flow from a JSON file. These features are documented in detail in `PERSISTENCE.md`.

## Technical Implementation

The header is built as a single React component, `Header.tsx`, and uses `framer-motion` for animations.

### Component Structure

```tsx
// src/components/canvas/Header.tsx
import { PersistenceStatus, PersistenceControls } from './PersistenceControls';

export function Header() {
    return (
        <motion.header ...>
            <div className="flex items-center">
                {/* Back button and title */}
                <div ...>
                    <h1>{headerData.title}</h1>
                    {/* ... other info ... */}
                </div>

                {/* Persistence controls on the right */}
                <div className="ml-auto">
                    <PersistenceControls />
                </div>
            </div>
        </motion.header>
    );
}
```

### Animation

- **Framer Motion**: The entire header and its individual elements use `framer-motion` to animate into view when the page loads. Buttons have subtle `whileHover` and `whileTap` effects for a responsive feel.
- **Staggered Loading**: Animations are slightly delayed and staggered to create a more polished entry sequence.

### Static Data

- The descriptive data in the header is currently hardcoded in `src/lib/canvas-data.ts`. In a real application, this would be fetched dynamically based on the flow being edited.
