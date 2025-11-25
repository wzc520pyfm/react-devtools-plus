# React 17 + SCSS + Node 14+ Playground

This playground is designed to test the backward compatibility of React DevTools with legacy technology stacks.

## Technology Stack

- **React 17.0.2** - Using the legacy `ReactDOM.render()` API
- **React Router v5** - Compatible with React 17
- **SCSS/Sass** - CSS preprocessor with variables, mixins, and nesting
- **Node 14+** - Minimum Node.js version supported
- **TypeScript 5.9** - With ES2017 compilation target
- **Vite 7** - Modern build tool with SCSS support

## Features

This playground demonstrates:

✅ React 17 compatibility with React DevTools
✅ SCSS preprocessing and features (variables, mixins, nesting)
✅ Node 14+ runtime compatibility (ES2017 target)
✅ Legacy React Router v5 with React 17
✅ Theme system from `@react-devtools/ui`
✅ React Scan integration

## Getting Started

### Install Dependencies

From the repository root:

```bash
pnpm install
```

### Run Development Server

```bash
# From repository root
pnpm play:react17

# Or from this directory
pnpm dev
```

The playground will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Opening React DevTools

Use the keyboard shortcut to open React DevTools overlay:

- **macOS**: `Option + Shift + R`
- **Windows/Linux**: `Alt + Shift + R`

## SCSS Features Demonstrated

The `src/style.scss` file demonstrates:

- **Variables**: `$primary-color`, `$secondary-color`, etc.
- **Mixins**: `@mixin flex-center`, `@mixin card-style`
- **Nesting**: `.layout__header`, `.card__title`, etc.
- **Functions**: `darken()`, `lighten()`
- **Parent selector**: `&:hover`, `&--modifier`

## React 17 Differences

This playground uses React 17 APIs:

```tsx
// React 17 (this playground)
ReactDOM.render(
  <App />,
  document.getElementById('root')
)

// React 18+ (other playgrounds)
ReactDOM.createRoot(document.getElementById('root')!).render(
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

## Testing Checklist

- [ ] React DevTools overlay opens correctly
- [ ] Component tree inspection works
- [ ] Props and state inspection works
- [ ] SCSS styles are compiled correctly
- [ ] Theme system works properly
- [ ] React Scan integration works
- [ ] Hot Module Replacement (HMR) works
- [ ] Production build works

## Known Limitations

- React 17 doesn't support concurrent features
- React Router v5 doesn't support `useRoutes` hook
- Some newer React features may not be available

## Related Playgrounds

- `packages/playground/react` - React 18+ with modern features
- `packages/playground/react-webpack` - Webpack-based setup
- `packages/playground/react17-scss` - **This playground** (React 17 + SCSS)
