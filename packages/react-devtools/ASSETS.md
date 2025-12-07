# Assets Feature

The Assets feature allows you to browse and inspect static files in your project directly from the React DevTools panel. Unlike Vue DevTools which only supports Vite, this implementation works with both **Vite** and **Webpack**.

## Overview

Assets provides a file browser that shows all static assets in your project, including:

- **Images** - PNG, JPG, JPEG, GIF, SVG, WebP, ICO, etc.
- **Videos** - MP4, WebM, MOV, AVI, etc.
- **Audio** - MP3, WAV, OGG, FLAC, etc.
- **Fonts** - WOFF, WOFF2, TTF, OTF, EOT, etc.
- **Text files** - JSON, TXT, MD, JS, TS, TSX, JSX, etc.
- **WebAssembly** - WASM files

## Features

### File Browser

- **Grid View** - Display assets as thumbnails with file names
- **List View** - Display assets in a compact list format
- **Search** - Filter assets by file name or path
- **Extension Filter** - Show/hide specific file types
- **Folder Grouping** - Assets are organized by their folder structure

### Asset Details

When you click on an asset, a details panel shows:

- **Preview** - Visual preview for images, videos, audio, and text files
- **File Path** - Full path to the file on disk
- **Public Path** - URL path to access the file in the browser
- **Type** - Asset type (image, video, audio, font, text, etc.)
- **Image Size** - Width and height for images
- **Aspect Ratio** - Calculated aspect ratio for images
- **File Size** - Size in bytes, KB, or MB
- **Last Modified** - When the file was last changed

### Actions

- **Download** - Download the asset file
- **Copy Public Path** - Copy the URL to clipboard
- **Open in Browser** - Open the asset in a new browser tab
- **Code Snippet** - Ready-to-use HTML code for images

## How to Use

### 1. Access Assets Page

1. Open your React app with React DevTools enabled
2. Press `Alt/Option + Shift + D` to toggle the DevTools overlay
3. Click the **Assets** icon (🖼️) in the sidebar

### 2. Browse Files

- Use the **search box** to filter by file name
- Click the **filter icon** to show/hide specific file types
- Toggle between **grid** and **list** view using the view toggle button
- Click **refresh** to rescan the project for new files

### 3. View Details

- Click on any asset to open the details panel
- Preview images, videos, and text files directly
- Copy paths or download files using the action buttons

## Supported Environments

| Environment   | Support         |
| ------------- | --------------- |
| **Vite**      | ✅ Full support |
| **Webpack 4** | ✅ Full support |
| **Webpack 5** | ✅ Full support |

## Configuration

The Assets feature works automatically with no configuration needed. It scans the following directories:

- Project root directory
- Public directory (configurable)

### Custom File Types

You can configure which file types to display by default in the Assets panel:

```typescript
// vite.config.ts
import ReactDevTools from 'react-devtools/vite'

export default {
  plugins: [
    ReactDevTools({
      assets: {
        // Only show these file types by default
        files: ['png', 'jpg', 'svg', 'ico', 'gif', 'webp', 'mp4', 'json', 'md']
      }
    })
  ]
}
```

**Default Visible Extensions** (when no `assets.files` config is provided):

- **Images**: `png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`, `avif`, `ico`, `bmp`, `tiff`
- **Videos**: `mp4`, `webm`, `ogv`, `mov`, `avi`
- **Audio**: `mp3`, `wav`, `ogg`, `flac`, `aac`
- **Fonts**: `woff`, `woff2`, `eot`, `ttf`, `otf`
- **Documents**: `pdf`, `md`
- **Data**: `json`, `yaml`, `yml`, `toml`

Source code files (`ts`, `tsx`, `js`, `jsx`) are hidden by default but can be enabled via the filter menu.

### Ignored Directories

The following directories are automatically ignored:

- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- Lock files (package-lock.json, pnpm-lock.yaml, yarn.lock)

## API Endpoints

The Assets feature exposes the following API endpoints:

### GET `/__react_devtools__/api/assets`

Returns a list of all static assets in the project.

**Response:**

```json
[
  {
    "path": "logo.png",
    "type": "image",
    "publicPath": "/logo.png",
    "relativePath": "public/logo.png",
    "filePath": "/path/to/project/public/logo.png",
    "size": 12345,
    "mtime": 1699123456789
  }
]
```

### GET `/__react_devtools__/api/assets/refresh`

Forces a rescan of the project assets and returns the updated list.

### GET `/__react_devtools__/api/assets/image-meta?path=<filepath>`

Returns image metadata for the specified file.

**Response:**

```json
{
  "width": 1920,
  "height": 1080,
  "type": "png",
  "mimeType": "image/png"
}
```

### GET `/__react_devtools__/api/assets/text-content?path=<filepath>&limit=<number>`

Returns the text content of a file (first N characters).

**Response:**

```json
{
  "content": "File content here..."
}
```

## Technical Details

### File Scanning

The Assets feature uses `fast-glob` to efficiently scan the project for static files. The scan is cached and only refreshed when:

- The user clicks the refresh button
- The `/__react_devtools__/api/assets/refresh` endpoint is called

### Image Metadata

Image dimensions are extracted using the `image-meta` package, which reads image headers without loading the entire file into memory.

### Middleware Integration

#### Vite

The assets middleware is added in `setupDevServerMiddlewares`:

```typescript
server.middlewares.use(createAssetsMiddleware({
  root: config.projectRoot,
  publicDir: server.config.publicDir || 'public',
  baseUrl: base,
}))
```

#### Webpack

The assets middleware is added in `setupWebpackDevServerMiddlewares`:

```typescript
{
  name: 'react-devtools-assets',
  middleware: createAssetsMiddleware({
    root: config.projectRoot,
    publicDir: 'public',
    baseUrl: '/',
  }),
}
```

## Examples

### Example 1: Finding Images

1. Open the Assets page
2. Click the filter icon
3. Uncheck all extensions except `png`, `jpg`, `svg`
4. Browse only image files

### Example 2: Getting Image Code

1. Click on an image asset
2. Scroll down to "Code Snippet" section
3. Copy the `<img>` tag with proper dimensions
4. Paste into your component

### Example 3: Previewing Text Files

1. Navigate to a `.json` or `.md` file
2. Click to open details
3. View the file content preview
4. Copy or download if needed

## Differences from Vue DevTools

| Feature          | Vue DevTools   | React DevTools       |
| ---------------- | -------------- | -------------------- |
| Vite Support     | ✅             | ✅                   |
| Webpack Support  | ❌             | ✅                   |
| Image Preview    | ✅             | ✅                   |
| Video Preview    | ✅             | ✅                   |
| Audio Preview    | ✅             | ✅                   |
| Text Preview     | ✅             | ✅                   |
| Font Preview     | ✅             | ✅ (basic)           |
| File Upload      | ✅             | ❌ (not implemented) |
| Module Importers | ✅ (Vite only) | ❌ (not implemented) |

## Future Enhancements

Potential future improvements:

- File upload functionality
- Module importers tracking (which files import this asset)
- Asset optimization suggestions
- Drag and drop support
- Asset renaming/deleting
- Multiple selection for batch operations
