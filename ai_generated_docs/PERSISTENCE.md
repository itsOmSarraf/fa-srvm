# Flow Editor Persistence

This document outlines the persistence features implemented for the flow editor application.

## Features

### 🔄 Auto-Save (localStorage)

- **Real-time persistence**: Every change to nodes and connections is automatically saved to localStorage
- **Browser persistence**: Data persists across page refreshes and browser sessions
- **Efficient storage**: Only essential data is persisted (nodes, edges, UI preferences)
- **Error handling**: Graceful fallback when localStorage is unavailable

### 💾 File Export/Import

- **Export flows**: Save your current flow as a JSON file
- **Import flows**: Load previously saved flows from files
- **Timestamped exports**: Exported files include creation timestamp
- **Validation**: Import validates file structure before loading

### 📊 Storage Information

- **Real-time stats**: View current node count, edge count, and storage size
- **Storage status**: Visual indicators for save status and data availability
- **Clear storage**: Reset to default state with confirmation

## Technical Implementation

### Zustand + Persist Middleware

```typescript
// Automatic localStorage synchronization
export const useFlowStore = create<FlowState>()(
	persist(
		(set, get) => ({
			// ... store implementation
		}),
		{
			name: 'flow-storage',
			storage: createJSONStorage(() => localStorage),
			version: 1,
			partialize: (state) => ({
				nodes: state.nodes,
				edges: state.edges,
				isSidebarCollapsed: state.isSidebarCollapsed
			})
		}
	)
);
```

### Benefits over Plain localStorage

1. **Automatic serialization/deserialization**
2. **Selective persistence** (exclude temporary UI state)
3. **Migration support** for future schema changes
4. **Error recovery** with graceful fallbacks
5. **Built-in versioning** for data compatibility

### Performance Optimizations

- **Debounced writes**: Changes are batched for performance
- **Minimal data**: Only essential state is persisted
- **JSON compression**: Efficient storage format
- **Lazy loading**: Data loaded only when needed

## Usage

### Automatic Features

- Data is automatically saved on every change
- Status indicator shows last save time
- Visual feedback for save status

### Manual Controls

- **Export**: Download current flow as JSON file
- **Import**: Upload and load flow from JSON file
- **Reset**: Clear all data and return to default state
- **Info**: View storage statistics and controls

### Component Integration

```tsx
import {
	PersistenceControls,
	PersistenceStatus
} from '@/components/canvas/PersistenceControls';
import { usePersistence } from '@/hooks/usePersistence';

// In your component
const { saveToFile, loadFromFile, getStorageInfo } = usePersistence();
```

## Migration Path

### From Plain localStorage

If you were previously using basic localStorage:

1. **Automatic migration**: The new system will automatically detect and migrate existing data
2. **Backup recommended**: Export your current flows before updating
3. **Fallback**: System gracefully handles corrupted or invalid data

### Version Management

- **Schema versioning**: Future changes won't break existing saves
- **Backward compatibility**: Older saves will be automatically upgraded
- **Migration hooks**: Custom migration logic for complex changes

## Browser Compatibility

| Feature       | Chrome | Firefox | Safari | Edge |
| ------------- | ------ | ------- | ------ | ---- |
| localStorage  | ✅     | ✅      | ✅     | ✅   |
| File download | ✅     | ✅      | ✅     | ✅   |
| File upload   | ✅     | ✅      | ✅     | ✅   |
| JSON parsing  | ✅     | ✅      | ✅     | ✅   |

## Storage Limits

- **localStorage**: ~5-10MB per domain (browser dependent)
- **File exports**: No limit (saved to user's device)
- **Typical flow**: ~10-50KB for moderate complexity flows
- **Large flows**: 100+ nodes typically under 500KB

## Troubleshooting

### Data Not Persisting

1. Check if localStorage is enabled in browser
2. Verify domain settings allow local storage
3. Check available storage space
4. Try clearing browser cache and reloading

### Import Failures

1. Verify JSON file format is valid
2. Check file was exported from compatible version
3. Ensure file hasn't been corrupted
4. Try exporting a simple flow first to test

### Performance Issues

1. Check localStorage size (clear if needed)
2. Reduce flow complexity if possible
3. Export and reimport to clean up data
4. Clear browser cache

## Future Enhancements

### Planned Features

- **Cloud sync**: Optional cloud storage integration
- **Version history**: Multiple save states and undo/redo
- **Collaborative editing**: Real-time collaboration features
- **Export formats**: Support for additional file formats

### Alternative Storage Options

- **IndexedDB**: For larger datasets (>5MB)
- **Web SQL**: Legacy browser support
- **Cloud providers**: Firebase, Supabase integration
- **Custom backends**: API-based persistence

## Security Considerations

- **Local only**: Data stored locally in browser by default
- **No telemetry**: No data sent to external servers
- **User control**: Complete user control over data
- **Export encryption**: Optional encryption for sensitive flows

---

_This persistence system provides a robust, user-friendly way to maintain flow state across sessions while offering advanced features for power users._
