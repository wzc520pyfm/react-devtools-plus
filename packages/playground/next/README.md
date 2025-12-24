# React DevTools Plus - Next.js Playground

This is a demo project for testing React DevTools Plus integration with Next.js 15 (App Router).

## Integration Steps (Only 3 Steps!)

### Step 1: Wrap your Next.js config

```ts
// next.config.ts
import { withReactDevTools } from 'react-devtools-plus/next'

const nextConfig = {
  // your config
}

export default withReactDevTools(nextConfig)
```

### Step 2: Add DevToolsScript to your layout

```tsx
// app/layout.tsx
import { DevToolsScript } from 'react-devtools-plus/next/client'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DevToolsScript basePath="/devtools" />
      </body>
    </html>
  )
}
```

### Step 3: Create the API route (one-line!)

```ts
// app/devtools/[[...path]]/route.ts
export { GET } from 'react-devtools-plus/next/api'
```

**That's it!** No complex configuration needed.

## Usage

- Press `Option(⌥) + Shift(⇧) + D` to toggle DevTools panel
- Visit `/devtools` to open DevTools in a new tab
- React Scan automatically detects renders

## Running the Playground

```bash
pnpm dev
```

Open http://localhost:3000

## Features

- ✅ Next.js 15 App Router
- ✅ React 19
- ✅ Turbopack support
- ✅ React Scan integration
- ✅ DevTools overlay panel
- ✅ Component tree inspection
