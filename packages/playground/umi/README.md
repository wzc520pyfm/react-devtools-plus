# React DevTools Plus - Umi Playground

This playground demonstrates the integration of **React DevTools Plus** with the **Umi** framework.

## Features

- 🔧 **Umi Integration** - Uses `chainWebpack` to integrate react-devtools-plus
- 🔍 **Component Inspection** - Inspect React components in real-time
- ⚡ **React Scan** - Built-in render performance monitoring
- 🎨 **Theme Demo** - Test theme switching capabilities
- 🔌 **Custom Plugin** - Example of creating a DevTools plugin

## Getting Started

### Prerequisites

Make sure you have installed dependencies at the project root:

```bash
cd /path/to/react-devtools
pnpm install
```

### Development

Start the development server:

```bash
pnpm --filter @react-devtools-plus/playground-umi dev
```

Or navigate to this directory:

```bash
cd packages/playground/umi
pnpm dev
```

The app will be available at `http://localhost:8000`.

### Accessing DevTools

- Open `http://localhost:8000/__react_devtools__/` to view the DevTools panel
- Press `Alt(⌥)+Shift(⇧)+D` to toggle the DevTools panel
- Press `Alt(⌥)+Shift(⇧)+R` to show/hide the overlay

## Project Structure

```
packages/playground/umi/
├── .umirc.ts           # Umi configuration (with react-devtools-plus)
├── src/
│   ├── pages/
│   │   ├── index.tsx       # Home page
│   │   ├── about.tsx       # About page
│   │   ├── theme.tsx       # Theme demo page
│   │   └── counter.tsx     # Performance demo page
│   ├── layouts/
│   │   └── index.tsx       # App layout with navigation
│   ├── plugins/
│   │   └── MyPlugin.tsx    # Custom DevTools plugin
│   └── global.less         # Global styles
├── package.json
└── tsconfig.json
```

## Integration Method

The integration uses Umi's `chainWebpack` configuration:

```typescript
// .umirc.ts
import { reactDevToolsPlus } from 'react-devtools-plus/webpack';

export default defineConfig({
  chainWebpack(memo, { webpack }) {
    memo.plugin('react-devtools-plus').use(
      reactDevToolsPlus({
        enabledEnvironments: ['development', 'test'],
        plugins: [
          {
            name: 'umi-plugin',
            view: {
              title: 'Umi Plugin',
              src: './plugins/MyPlugin.tsx',
            },
          },
        ],
        scan: {
          enabled: true,
          showToolbar: false,
        },
      })
    );
    return memo;
  },
});
```

## Pages Overview

### Home (`/`)

Landing page with feature cards and interactive elements.

### About (`/about`)

Information about React DevTools Plus features and Umi integration.

### Theme (`/theme`)

Theme switching demo with color palette visualization.

### Counter (`/counter`)

Performance testing page demonstrating:

- Memoized vs non-memoized components
- State update tracking
- React Scan visualization

## Testing the Integration

1. **Component Tree**: Check if components are correctly displayed in the DevTools panel
2. **Props & State**: Inspect component props and state changes
3. **React Scan**: Enable the scan overlay to visualize re-renders
4. **Custom Plugin**: Verify the custom Umi plugin appears in the DevTools panel
5. **Source Location**: Click on components to open source files in your editor

## Troubleshooting

### DevTools not showing

1. Make sure you're running in development mode
2. Check the browser console for errors
3. Verify the plugin is correctly configured in `.umirc.ts`

### React Scan not working

1. Ensure `scan.enabled` is set to `true`
2. Press `Alt(⌥)+Shift(⇧)+R` to toggle scan visibility
3. Check if the scan overlay is visible

## License

MIT
