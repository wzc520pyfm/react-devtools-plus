# React Webpack Playground

This is a playground for React applications using Webpack with React DevTools support via unplugin.

## Features

- ✅ React DevTools support via `react-devtools/webpack`
- ✅ Hot Module Replacement (HMR)
- ✅ Development server with DevTools client

## Usage

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## React DevTools

The playground uses the unplugin-based React DevTools plugin, which supports both Vite and Webpack.

To configure DevTools, edit `webpack.config.js`:

```javascript
const ReactDevToolsPlugin = require('react-devtools/webpack')

module.exports = {
  plugins: [
    ReactDevToolsPlugin({
      enabledEnvironments: ['development', 'test'],
    }),
  ],
}
```

## How It Works

The plugin uses [unplugin](https://github.com/unjs/unplugin) to provide a unified plugin interface that works with both Vite and Webpack. This means:

- Same API for both build tools
- Consistent behavior across environments
- Easy migration between Vite and Webpack
