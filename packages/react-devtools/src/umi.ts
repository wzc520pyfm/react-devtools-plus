/**
 * Umi Plugin Entry
 *
 * @example
 * ```ts
 * // plugin.ts (in your Umi project)
 * import { createUmiPlugin } from 'react-devtools-plus/umi'
 *
 * export default createUmiPlugin({
 *   scan: { enabled: true },
 * })
 * ```
 *
 * Then add to .umirc.ts:
 * ```ts
 * export default defineConfig({
 *   plugins: ['./plugin.ts'],
 * })
 * ```
 */

import { createUmiPlugin } from './integrations/umi.js'

export { createUmiPlugin }
export default createUmiPlugin
export type { ReactDevToolsPluginOptions } from './config/types.js'
