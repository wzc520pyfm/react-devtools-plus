/**
 * Next.js Plugin Entry
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
 * @example With options
 * ```ts
 * import { withReactDevTools } from 'react-devtools-plus/next'
 *
 * export default withReactDevTools(
 *   {
 *     // your Next.js config
 *   },
 *   {
 *     // React DevTools Plus options
 *     scan: { enabled: true },
 *   }
 * )
 * ```
 *
 * @example Using DevToolsProvider for App Router
 * ```tsx
 * // app/layout.tsx
 * import { DevToolsProvider } from 'react-devtools-plus/next'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <DevToolsProvider>{children}</DevToolsProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * @example Using webpack config directly
 * ```ts
 * // next.config.ts
 * import { createNextPlugin } from 'react-devtools-plus/next'
 *
 * const nextConfig = {
 *   webpack: (config, { dev, isServer }) => {
 *     if (dev && !isServer) {
 *       config.plugins.push(createNextPlugin())
 *     }
 *     return config
 *   },
 * }
 *
 * export default nextConfig
 * ```
 */

import { createNextPlugin, withReactDevTools } from './integrations/next.js'

// Export configuration wrappers
export { createNextPlugin, withReactDevTools }

// Export React component for client-side use
export { DevToolsProvider } from './client/DevToolsProvider.js'
export type { DevToolsProviderProps } from './client/DevToolsProvider.js'

// Export types
export type { ReactDevToolsPluginOptions } from './config/types.js'

// Default export
export default withReactDevTools

