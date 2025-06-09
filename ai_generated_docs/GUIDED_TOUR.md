# Guided Tour System

The Canvas features an interactive guided tour built with **React Joyride** that helps new users understand and navigate all the key components and features of the workflow design interface.

## Overview

The guided tour provides a step-by-step walkthrough of the canvas interface, highlighting key components and explaining their functionality. It's designed to onboard new users quickly and effectively.

## Core Features

- **Smart First-Time Detection**: Automatically detects new users and offers the tour
- **Persistent Help Access**: Always-available help button for returning users
- **Dynamic Step Generation**: Tour steps adapt based on current interface state
- **Smooth Animations**: Beautiful transitions with Framer Motion integration
- **Progress Tracking**: Visual progress indicator throughout the tour
- **Graceful Error Handling**: Skips missing elements and continues gracefully

## Tour Flow

### Step Sequence

1. **Welcome** - Introduction to the canvas workspace
2. **Header Section** - Workflow information and controls
3. **Persistence Controls** - Save/load functionality
4. **Workflow Canvas** - Main workspace interaction guide
5. **Node Management** - Sidebar or toolbar based on current state
6. **AI Assistant** - AI-powered workflow help
7. **Completion** - Final tips and keyboard shortcuts

### Adaptive Behavior

The tour intelligently adapts to the current interface state:

- **Sidebar Collapsed**: Shows floating toolbar tour step
- **Sidebar Expanded**: Shows sidebar node types tour step
- **Missing Elements**: Automatically skips and continues

## Technical Implementation

### Main Component

The tour is implemented in `CanvasTour.tsx` and integrated into the main canvas page.

```tsx
// src/components/canvas/CanvasTour.tsx
export function CanvasTour({ autoStart = false }: CanvasTourProps) {
	// Tour state management
	const [isRunning, setIsRunning] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);
	const [showStartButton, setShowStartButton] = useState(false);

	// Integration with app state
	const { isSidebarCollapsed, setSidebarCollapsed } = useFlowStore();
}
```

### Dynamic Step Creation

Steps are generated dynamically based on current interface state:

```tsx
// Create tour steps dynamically to handle conditional elements
const createTourSteps = (isSidebarCollapsed: boolean): Step[] => [
  // ... static steps
  {
    target: isSidebarCollapsed ? '[data-tour="sidebar-left-toggle"]' : '[data-tour="sidebar-left"]',
    content: (/* Dynamic content based on sidebar state */),
    placement: 'right',
  },
  // ... more steps
];
```

### Tour Data Attributes

Components are marked with `data-tour` attributes for targeting:

- `data-tour="header"` - Header component
- `data-tour="header-persistence"` - Persistence controls
- `data-tour="sidebar-left-toggle"` - Collapsed sidebar button
- `data-tour="sidebar-left"` - Expanded sidebar
- `data-tour="playground"` - Main canvas area
- `data-tour="node-toolbar"` - Floating toolbar
- `data-tour="sidebar-right"` - Configuration panel
- `data-tour="ai-chat"` - AI assistant button

### Event Handling

The tour responds to various events to provide smooth navigation:

```tsx
const handleJoyrideCallback = useCallback((data: CallBackProps) => {
	const { status, type, index } = data;

	if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
		// Mark tour as completed and hide
		localStorage.setItem('canvas-tour-completed', 'true');
		setIsRunning(false);
	} else if (type === EVENTS.STEP_AFTER) {
		// Progress to next step
		setStepIndex(index + 1);
	} else if (type === EVENTS.TARGET_NOT_FOUND) {
		// Gracefully skip missing elements
		console.warn(`Tour target not found for step ${index}`);
		setStepIndex(index + 1);
	}
}, []);
```

## User Experience Features

### First-Time User Experience

- **Automatic Detection**: Checks localStorage for previous tour completion
- **Prominent Invitation**: Shows attractive "Take Tour" prompt for new users
- **Easy Dismissal**: Users can dismiss the invitation if not interested

### Returning User Support

- **Always Available**: Help button in top-right corner
- **Quick Access**: Single click to restart tour anytime
- **No Persistence**: Doesn't annoy returning users with automatic prompts

### Visual Design

- **Custom Styling**: Tailored to match application design language
- **Smooth Animations**: Framer Motion integration for polished feel
- **Responsive Layout**: Works across different screen sizes
- **High Contrast**: Ensures accessibility and visibility

## Configuration

### Joyride Settings

```tsx
<Joyride
	steps={createTourSteps(isSidebarCollapsed)}
	run={isRunning}
	continuous
	showProgress
	showSkipButton
	scrollToFirstStep
	disableOverlayClose
	spotlightClicks
	debug={process.env.NODE_ENV === 'development'}
	styles={{
		options: {
			primaryColor: '#2563eb',
			backgroundColor: '#ffffff',
			textColor: '#374151',
			zIndex: 10000
		}
		// ... more styling
	}}
/>
```

### Customization Options

- **Auto-start**: Can be configured to start automatically
- **Step Content**: Rich HTML content with lists and formatting
- **Placement**: Strategic positioning for optimal visibility
- **Styling**: Comprehensive theme customization

## Integration

### Canvas Page Integration

```tsx
// src/app/canvas/page.tsx
import { CanvasTour } from '@/components/canvas/CanvasTour';

function Page() {
	return (
		<motion.div className='flex flex-col w-full min-h-screen'>
			{/* ... other components */}
			<CanvasTour />
		</motion.div>
	);
}
```

### Component Marking

Components include tour data attributes for targeting:

```tsx
// Example component marking
<motion.header
	data-tour='header'
	className='...'>
	{/* Header content */}
	<div
		data-tour='header-persistence'
		className='ml-auto'>
		<PersistenceControls />
	</div>
</motion.header>
```

## Best Practices

### Tour Design

- **Keep Steps Focused**: Each step covers one main concept
- **Use Clear Language**: Simple, actionable instructions
- **Provide Context**: Explain not just what, but why
- **Show Benefits**: Highlight value of each feature

### Technical Implementation

- **Graceful Degradation**: Handle missing elements smoothly
- **Performance**: Minimize re-renders and state updates
- **Accessibility**: Ensure tour works with screen readers
- **Mobile Responsiveness**: Adapt to smaller screens

## Dependencies

- **react-joyride**: Main tour functionality
- **@types/react-joyride**: TypeScript definitions
- **framer-motion**: Animation integration
- **zustand**: State management integration

The guided tour significantly improves user onboarding and feature discovery, making the complex workflow editor more accessible to new users while providing ongoing support for all users.
