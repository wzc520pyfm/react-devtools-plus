# Timeline Feature

The Timeline feature is a powerful debugging tool that records and analyzes runtime events in your React application. It helps you understand user interactions, component events, and performance metrics in real-time.

## Overview

Timeline provides a chronological view of events happening in your application, making it easier to:

- **Debug user interactions** - Track mouse clicks, keyboard input, and other user actions
- **Monitor component events** - See when components emit custom events
- **Analyze performance** - Understand component lifecycle events like render, mount, and update

## Event Layers

Timeline organizes events into four distinct layers:

| Layer | Description | Events Recorded |
|-------|-------------|-----------------|
| **Mouse** | Mouse interaction events | `mousedown`, `mouseup`, `click`, `dblclick` |
| **Keyboard** | Keyboard input events | `keydown`, `keyup`, `keypress` |
| **Component events** | Custom component events | Events emitted by your components |
| **Performance** | Component lifecycle events | `render`, `mount`, `update`, `unmount`, `patch`, `init` |

Each layer can be individually enabled or disabled to reduce performance overhead.

## How to Use

### 1. Access Timeline

1. Open your React app with React DevTools enabled
2. Press `Alt/Option + Shift + R` to toggle the DevTools overlay
3. Click the **Timeline** icon (📊) in the sidebar

### 2. Start Recording

1. Click the **record button** (circular button) in the top-left corner of the Timeline panel
2. The button will turn red and pulse when recording is active
3. Events will start being captured as you interact with your application

### 3. Select Event Layer

- Click on any event layer in the left panel (Mouse, Keyboard, Component events, or Performance)
- The selected layer will be highlighted, and only events from that layer will be displayed
- Hover over a layer name and click "Enable/Disable" to toggle event collection for that layer

### 4. View Event Details

- Events are displayed chronologically in the center panel
- Each event shows:
  - **Timestamp** - When the event occurred
  - **Title** - Event name or component name
  - **Subtitle** - Additional context (e.g., event type, component action)
- Click any event to view detailed information in the right panel
- Related events (like performance start/end pairs) are grouped by color

### 5. Clear Events

- Click the **delete button** (trash icon) to clear all recorded events
- This is useful when you want to start fresh or focus on specific interactions

## Event Information

### Mouse Events

Mouse events include:
- Event type (mousedown, mouseup, click, dblclick)
- Mouse coordinates (x, y)

**Example:**
```json
{
  "type": "click",
  "x": 150,
  "y": 200
}
```

### Keyboard Events

Keyboard events include:
- Event type (keydown, keyup, keypress)
- Key pressed
- Modifier keys (Ctrl, Shift, Alt, Meta)

**Example:**
```json
{
  "type": "keydown",
  "key": "Enter",
  "ctrlKey": false,
  "shiftKey": false,
  "altKey": false,
  "metaKey": false
}
```

### Component Events

Component events are custom events emitted by your components:
- Component name
- Event name
- Event parameters

**Example:**
```json
{
  "component": "MyComponent",
  "event": "onSubmit",
  "params": { "formData": {...} }
}
```

### Performance Events

Performance events track component lifecycle:
- Component name
- Event type (render, mount, update, etc.)
- Measure (start or end)
- Duration (for end events)

**Example:**
```json
{
  "component": "MyComponent",
  "type": "render",
  "measure": "start"
}
```

Performance events are grouped together, showing the duration between start and end events.

## API Usage

You can programmatically add events to the Timeline using the Timeline API:

### Adding Component Events

```typescript
import { addComponentEvent } from '@react-devtools/kit'

// In your component
const handleSubmit = (data: FormData) => {
  // Your component logic
  addComponentEvent('MyForm', 'onSubmit', { formData: data })
}
```

### Adding Performance Events

```typescript
import { addPerformanceEvent } from '@react-devtools/kit'

// Track custom performance metrics
const startTime = performance.now()
// ... your code ...
const duration = performance.now() - startTime

addPerformanceEvent('render', 'MyComponent', 'start', undefined, 'my-render-group')
addPerformanceEvent('render', 'MyComponent', 'end', duration, 'my-render-group')
```

### Tracking Fiber Performance

```typescript
import { trackFiberPerformanceStart, trackFiberPerformanceEnd } from '@react-devtools/kit'

// In your component or hook
useEffect(() => {
  trackFiberPerformanceStart(fiber, 'render')
  // ... component logic ...
  trackFiberPerformanceEnd(fiber, 'render')
}, [dependencies])
```

## Performance Considerations

⚠️ **Important**: Timeline event collection can cause significant performance overhead in large applications.

### Best Practices

1. **Enable only when needed** - Start recording only when you need to debug
2. **Disable unused layers** - Turn off event layers you don't need
3. **Stop recording when done** - Always stop recording after debugging
4. **Clear events regularly** - Clear old events to reduce memory usage

### Performance Tips

- **Mouse/Keyboard events**: Generally lightweight, safe to keep enabled
- **Component events**: Minimal overhead, enable as needed
- **Performance events**: Can be expensive, enable only when analyzing performance

## Technical Details

### Event Collection

Events are collected through:

1. **Browser Event Listeners** - Mouse and keyboard events are captured via native DOM event listeners
2. **React Hook Integration** - Performance events are tracked through React's Fiber tree
3. **Custom API Calls** - Component events are added programmatically

### Event Storage

- Events are stored in memory during the session
- Events are cleared when you click the delete button or refresh the page
- No events are persisted to disk or sent to external servers

### RPC Communication

Timeline events are communicated between the overlay and client via RPC:

- Events are collected in the overlay context (main page)
- Events are broadcast to the client iframe via RPC
- The client displays events in real-time

## Troubleshooting

### No events are showing

1. **Check recording status** - Make sure the record button is active (red and pulsing)
2. **Verify layer is enabled** - Hover over the layer and ensure it's enabled
3. **Check layer selection** - Make sure you've selected the correct event layer
4. **Refresh the page** - Try refreshing if events aren't appearing

### Events are missing

1. **Check if layer is disabled** - Some layers might be disabled by default
2. **Verify event source** - Make sure the events are actually occurring
3. **Check browser console** - Look for any errors that might prevent event collection

### Performance issues

1. **Disable unused layers** - Turn off layers you don't need
2. **Stop recording** - Stop recording when not actively debugging
3. **Clear old events** - Clear events regularly to free memory
4. **Check event volume** - Too many events can slow down the UI

### Events not grouping correctly

- Performance events are grouped by `groupId`
- Make sure start and end events use the same group key
- Check that both events are in the same layer

## Configuration

Timeline state can be managed programmatically:

```typescript
import { getTimelineState, updateTimelineState, clearTimeline } from '@react-devtools/kit'

// Get current state
const state = getTimelineState()
console.log(state.recordingState) // true/false
console.log(state.mouseEventEnabled) // true/false

// Update state
updateTimelineState({
  recordingState: true,
  mouseEventEnabled: true,
  keyboardEventEnabled: false,
})

// Clear all events
clearTimeline()
```

## Examples

### Example 1: Debugging User Interactions

1. Open Timeline
2. Select "Mouse" layer
3. Start recording
4. Click around your application
5. Review the click events and their coordinates

### Example 2: Analyzing Component Performance

1. Open Timeline
2. Select "Performance" layer
3. Start recording
4. Interact with your application to trigger renders
5. Review render times and identify slow components

### Example 3: Tracking Custom Events

```typescript
// In your component
import { addComponentEvent } from '@react-devtools/kit'

function MyComponent() {
  const handleAction = () => {
    // Your logic
    addComponentEvent('MyComponent', 'actionTriggered', { 
      actionType: 'buttonClick' 
    })
  }
  
  return <button onClick={handleAction}>Click me</button>
}
```

Then in Timeline:
1. Select "Component events" layer
2. Start recording
3. Click the button
4. See the custom event in the timeline

## Related Features

- **React Scan** - Performance analysis and render visualization
- **Components Tree** - Inspect component hierarchy and props
- **Graph** - View module dependencies and relationships

## Future Enhancements

Potential future improvements:

- Export timeline data for analysis
- Filter events by component or time range
- Search events by keyword
- Screenshot capture at event points
- Event replay functionality

