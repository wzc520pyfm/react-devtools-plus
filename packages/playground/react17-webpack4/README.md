# React 17 + SCSS + Webpack 4 + Node 14+ Playground

This playground is designed to test the backward compatibility of React DevTools with legacy build toolchains, specifically Webpack 4.

## Technology Stack

- **React 17.0.2** - Using the legacy `ReactDOM.render()` API
- **React Router v5.3** - Compatible with React 17
- **Webpack 4.46** - Last major version before Webpack 5
- **SCSS/Sass** - CSS preprocessor with sass-loader 10.x
- **Node 14+** - Minimum Node.js version supported
- **TypeScript 5.9** - With ES2017 compilation target
- **Babel 7** - With @babel/preset-env for ES2017

## Features

This playground demonstrates:

✅ React 17 compatibility with React DevTools
✅ Webpack 4 bundling with react-devtools plugin
✅ SCSS preprocessing with sass-loader 10.x
✅ Node 14+ runtime compatibility (ES2017 target)
✅ Legacy React Router v5 with React 17
✅ webpack-dev-server 3.x with HMR
✅ Theme system from `@react-devtools-plus/ui`
✅ React Scan integration

## Why Webpack 4?

Many legacy projects still use Webpack 4 because:

- Stable and well-tested in production
- Existing configurations that work
- Dependencies that haven't migrated to Webpack 5
- Migration complexity for large projects

This playground ensures React DevTools works seamlessly with Webpack 4 setups.

## Getting Started

### Install Dependencies

From the repository root:

```bash
pnpm install
```

### Run Development Server

```bash
# From repository root
pnpm play:react17-webpack4

# Or from this directory
pnpm dev
```

The playground will be available at `http://localhost:3005`.

## Development

### Available Scripts

- `pnpm dev` - Start webpack-dev-server (port 3005)
- `pnpm build` - Build for production

### Opening React DevTools

Use the keyboard shortcut to open React DevTools overlay:

- **macOS**: `Option + Shift + D`
- **Windows/Linux**: `Alt + Shift + D`

## Webpack 4 Configuration Highlights

### Key Dependencies

```json
{
  "webpack": "^4.46.0",
  "webpack-cli": "^3.3.12",
  "webpack-dev-server": "^3.11.3",
  "html-webpack-plugin": "^4.5.2",
  "babel-loader": "^8.2.5",
  "sass-loader": "^10.5.2",
  "css-loader": "^5.2.7",
  "style-loader": "^2.0.0"
}
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './src/main.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  devServer: {
    port: 3005,
    hot: true,
    historyApiFallback: true
  }
}
```

## SCSS Features Demonstrated

The `src/style.scss` file demonstrates:

- **Variables**: `$webpack-color`, `$secondary-color`, etc.
- **Mixins**: `@mixin flex-center`, `@mixin card-style`
- **Nesting**: `.layout__header`, `.card__title`, etc.
- **Functions**: `darken()`, `lighten()`
- **Parent selector**: `&:hover`, `&--modifier`

## React 17 vs React 18

This playground uses React 17 APIs:

```jsx
// React 17 (this playground)
import ReactDOM from 'react-dom'

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

// React 18+ (other playgrounds)
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <App />
)
```

## Browser Compatibility

The build target is ES2017, which is compatible with:

- Chrome 58+
- Firefox 52+
- Safari 11+
- Edge 79+
- Node 14+

## Webpack 4 vs Webpack 5

Key differences this playground demonstrates compatibility with:

| Feature           | Webpack 4         | Webpack 5         |
| ----------------- | ----------------- | ----------------- |
| Node.js           | 6+                | 10.13+            |
| Configuration     | webpack.config.js | webpack.config.js |
| Dev Server        | v3.x              | v4.x+             |
| HtmlWebpackPlugin | v4.x              | v5.x              |
| CSS/SCSS          | separate loaders  | same loaders      |

## Testing Checklist

- [ ] React DevTools overlay opens correctly
- [ ] Component tree inspection works
- [ ] Props and state inspection works
- [ ] SCSS styles are compiled correctly
- [ ] Webpack HMR works properly
- [ ] Theme system works correctly
- [ ] React Scan integration works
- [ ] Production build succeeds
- [ ] Build size is reasonable

## Known Limitations

- React 17 doesn't support concurrent features
- React Router v5 doesn't support `useRoutes` hook
- Webpack 4 has some missing optimizations from Webpack 5
- Some newer React features may not be available

## Migration Notes

If migrating from Webpack 4 to Webpack 5, consider:

1. Update Node.js to 10.13 or higher
2. Update webpack-cli to 4.x
3. Update webpack-dev-server to 4.x
4. Update html-webpack-plugin to 5.x
5. Review breaking changes in Webpack 5 migration guide

## Related Playgrounds

- `packages/playground/react` - React 18+ with Vite
- `packages/playground/react-webpack` - React 18 with Webpack 5
- `packages/playground/react17-scss` - React 17 with Vite
- `packages/playground/react17-webpack4` - **This playground** (React 17 + Webpack 4)

## Troubleshooting

### Port Already in Use

If port 3005 is occupied, modify `webpack.config.js`:

```javascript
devServer: {
  port: 3006, // Change to any available port
}
```

### SCSS Compilation Errors

Ensure sass-loader 10.x is installed (compatible with Webpack 4):

```bash
pnpm add -D sass-loader@10.5.2 sass@^1.83.4
```

### Webpack Dev Server Issues

Make sure you're using webpack-dev-server 3.x:

```bash
pnpm add -D webpack-dev-server@^3.11.3
```

## Performance Notes

Webpack 4 build times may be slower than Webpack 5 due to:

- Less aggressive caching
- Different optimization algorithms
- Older JavaScript parsing

This is expected and normal for Webpack 4 setups.
