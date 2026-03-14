/**
 * Rspack Plugin Entry
 *
 * @example
 * ```js
 * const { reactDevToolsPlus } = require('react-devtools-plus/rspack')
 *
 * module.exports = {
 *   plugins: [
 *     reactDevToolsPlus(),
 *   ],
 * }
 * ```
 */

import { rspack } from './unplugin.js'

export { rspack as reactDevToolsPlus }
export default rspack
export type { ReactDevToolsPluginOptions } from './unplugin.js'
