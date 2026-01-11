# react-devtools-plus

> Experimental in-app component tree inspector for React projects powered by Unplugin to support Vite and Webpack.

## Installation

```bash
pnpm add -D react-devtools-plus
```

## Usage

```ts
import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    reactDevToolsPlus(),
    react(),
  ],
})
```

### Keyboard shortcuts

- Press `Alt + Shift + D` (`Option + Shift + D` on macOS) to toggle the DevTools panel open/close
- Press `Alt + Shift + R` (`Option + Shift + R` on macOS) to toggle the overlay visibility (show/hide)

## What’s included

- Minimal Vite plugin that injects a lightweight overlay during development.
- Automatic instrumentation of React Fiber roots to mirror the component tree.
- Standalone preview page at `/__react_devtools__/` with project status.

## Documentation

- [Environment Control](./ENVIRONMENT_CONTROL.md) - Control DevTools availability in different environments
- [Open in Editor](./OPEN_IN_EDITOR.md) - Configure click-to-source-code functionality
- [Micro-Frontend Integration](./MICRO_FRONTEND.md) - Guide for qiankun, single-spa, micro-app integration
- [Webpack Support](./WEBPACK_SUPPORT.md) - Using with Webpack 4/5 and CRA
- [Timeline](./TIMELINE.md) - React render timeline tracking
- [Assets](./ASSETS.md) - Static assets panel configuration

## Limitations

- This plugin only targets the development server. Production builds are unaffected.
- The overlay renders a simplified tree and does not expose props/state editing yet.
- Running the official React DevTools extension simultaneously may produce duplicate updates; close one of them if you notice conflicts.
