/**
 * Next.js Plugin Entry (Server-side only)
 *
 * @example Using withReactDevTools wrapper
 * ```ts
 * // next.config.ts
 * import { withReactDevTools } from 'react-devtools-plus/next'
 *
 * const nextConfig = {
 *   // your config
 * }
 *
 * export default withReactDevTools(nextConfig)
 * ```
 *
 * @example Using DevToolsScript for App Router
 * ```tsx
 * // app/layout.tsx
 * import { DevToolsScript } from 'react-devtools-plus/next/client'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <DevToolsScript basePath="/devtools" />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

import { createNextPlugin, withReactDevTools } from './integrations/next.js'

// Export configuration wrappers (server-side)
export { createNextPlugin, withReactDevTools }

// Export types
export type { ReactDevToolsPluginOptions } from './config/types.js'

// Default export
export default withReactDevTools

