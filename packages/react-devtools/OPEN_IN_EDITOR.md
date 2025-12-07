# Open in Editor Feature

The React DevTools plugin now supports automatically opening React component source files in your editor when you click on elements in your app.

## How It Works

The plugin uses a multi-step process to inject source code location information and enable the "open in editor" functionality:

### 1. Source Code Injection

During the build process (both Vite and Webpack), the plugin uses Babel to transform your JSX/TSX files and inject `data-source-path` attributes into every JSX element.

**Example:**

Before transformation:

```jsx
<div className="app">
  <h1>Hello World</h1>
</div>
```

After transformation:

```jsx
<div className="app" data-source-path="/path/to/App.tsx:10:2">
  <h1 data-source-path="/path/to/App.tsx:11:4">Hello World</h1>
</div>
```

The `data-source-path` attribute contains the file path, line number, and column number in the format: `<filepath>:<line>:<column>`

### 2. Inspector Mode

The React DevTools overlay provides an inspector mode that allows you to select elements in your app and open their source code in your editor.

**To activate the inspector:**

1. Open your app with React DevTools enabled
2. Press `Alt/Option + Shift + D` to toggle the overlay
3. Click the "inspector" icon in the overlay
4. Click on any element in your app

The inspector will:

- Read the `data-source-path` attribute from the clicked element
- Send a request to the Vite dev server: `/__open-in-editor?file=<filepath>:<line>:<column>`
- Your configured editor will open the file at the exact location

### 3. Editor Configuration

The open-in-editor feature uses Vite's built-in functionality, which respects your editor configuration.

**Environment Variables:**

You can configure your editor using the `EDITOR` environment variable:

```bash
# For VS Code
EDITOR=code pnpm dev

# For Cursor (requires cursor CLI installed)
EDITOR=cursor pnpm dev

# For WebStorm
EDITOR=webstorm pnpm dev

# For Vim
EDITOR=vim pnpm dev
```

Or set it in your `package.json`:

```json
{
  "scripts": {
    "dev": "EDITOR=code vite",
    "dev:cursor": "EDITOR=cursor vite"
  }
}
```

**Installing Cursor CLI:**

If you get the error `spawn cursor ENOENT`, you need to install Cursor's command-line tool:

1. Open Cursor editor
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Shell Command: Install 'cursor' command in PATH"
4. Execute the command
5. Restart your terminal

**Installing VS Code CLI:**

For VS Code, the `code` command should be installed by default. If not:

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Shell Command: Install 'code' command in PATH"
4. Execute the command
5. Restart your terminal

**Launch Configuration:**

Vite also supports a `LAUNCH_EDITOR` environment variable for more advanced configurations:

```bash
LAUNCH_EDITOR=cursor://file/{file}:{line}:{column}
```

However, for most use cases, setting the `EDITOR` environment variable is sufficient.

## Supported Environments

- ✅ **Vite**: Full support with automatic source injection and open-in-editor
- ✅ **Webpack**: Full support! Source injection and open-in-editor are both supported

The Webpack implementation uses the `launch-editor` package to provide the same open-in-editor functionality as Vite. The middleware is automatically registered when using `webpack-dev-server`.

## Technical Details

### Babel Transformation

The plugin uses a Babel plugin to inject the `data-source-path` attributes:

```typescript
function sourceAttributePlugin() {
  return {
    name: 'source-attribute',
    visitor: {
      JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
        const loc = path.node.loc
        if (!loc)
          return

        const filename = this.file?.opts?.filename || ''
        if (!filename)
          return

        path.node.attributes.push(
          types.jsxAttribute(
            types.jsxIdentifier('data-source-path'),
            types.stringLiteral(`${filename}:${loc.start.line}:${loc.start.column}`)
          )
        )
      }
    }
  }
}
```

### Inspector Implementation

The inspector reads the `data-source-path` attribute from DOM elements:

```typescript
function getSourceFromElement(element: Element | null) {
  if (!element)
    return null

  let current = element
  while (current && current !== document.body) {
    const sourcePath = current.getAttribute('data-source-path')
    if (sourcePath) {
      return parseSourcePath(sourcePath)
    }
    current = current.parentElement
  }

  return null
}
```

When an element is clicked in "open-in-editor" mode:

```typescript
const source = getSourceFromElement(target)
if (source) {
  const { fileName, lineNumber, columnNumber } = source
  emitOpenInEditor(fileName, lineNumber, columnNumber)
}
```

### Fallback to \_debugSource

If the `data-source-path` attribute is not available, the inspector falls back to React's `_debugSource` property on Fiber nodes. However, this is less accurate and may not always be available in production builds.

## Advantages Over \_debugSource

The `data-source-path` attribute approach has several advantages:

1. **Accuracy**: The source location is injected at build time, ensuring it matches the actual source code
2. **Reliability**: Works consistently across development and production builds (if enabled)
3. **Simplicity**: Easy to inspect and debug using browser DevTools
4. **Performance**: Minimal runtime overhead

## Configuration Options

### Disabling Source Injection

You can control source code location injection using the `injectSource` option:

```typescript
// vite.config.ts or webpack.config.js
import ReactDevTools from 'react-devtools'

export default defineConfig({
  plugins: [
    ReactDevTools({
      // Disable HTML attribute injection (uses only Fiber._debugSource)
      injectSource: false
    })
  ]
})
```

**Default behavior:**

- ✅ Enabled in development mode (`serve`)
- ❌ Disabled in production builds (`build` with `production` mode)
- Can be explicitly controlled with the `injectSource` option

### Environment Control

Control when DevTools is enabled:

```typescript
// vite.config.ts
import ReactDevTools from 'react-devtools'

export default defineConfig({
  plugins: [
    ReactDevTools({
      // Only enable in development
      enabledEnvironments: ['development'],
      // Optionally disable source injection
      injectSource: false
    })
  ]
})
```

## Troubleshooting

### Error: "spawn cursor ENOENT" or "command does not exist in PATH"

This error means the editor command is not installed or not in your system's PATH.

**Solution:**

1. Install the command-line tool for your editor (see "Installing Cursor CLI" or "Installing VS Code CLI" above)
2. Or use a different editor that's already installed: `EDITOR=code pnpm dev`
3. Restart your terminal after installing the CLI tool
4. Verify the command works by running `cursor --version` or `code --version` in your terminal

### Editor doesn't open

1. Check that the `EDITOR` environment variable is set correctly
2. Verify that the dev server is running
3. Check the browser console for any errors related to `/__open-in-editor`
4. Check the terminal output for editor-related errors
5. Test if the editor command works manually: `cursor path/to/file.tsx:10:5`

**Fallback mechanism:**

The plugin automatically falls back to URL protocol if the server endpoint fails:

- Primary: `/__open-in-editor` endpoint (recommended)
- Fallback: `vscode://file/...` URL protocol

To configure the fallback editor, set it in localStorage:

```javascript
localStorage.setItem('react_devtools_editor', 'cursor')
// or 'vscode', 'webstorm', 'sublime', etc.
```

### Source locations are incorrect

1. Ensure source maps are enabled in your build configuration
2. Check that the `data-source-path` attributes are present in the rendered HTML
3. Verify that your Babel configuration isn't conflicting with the plugin

### Attributes not injected

1. Make sure the React DevTools plugin is loaded before other React plugins
2. Check that the `enforce: 'pre'` option is respected in your Vite config
3. Verify that JSX/TSX files are being processed by the plugin
