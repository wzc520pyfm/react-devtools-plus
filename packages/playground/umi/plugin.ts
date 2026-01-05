/**
 * React DevTools Plus - Umi Plugin
 *
 * This plugin integrates react-devtools-plus with Umi's dev server
 */
import { createUmiPlugin } from 'react-devtools-plus/umi'

export default createUmiPlugin({
  enabledEnvironments: ['development', 'test'],
  scan: {
    enabled: true,
    showToolbar: false,
    animationSpeed: 'fast',
  },
  launchEditor: 'cursor',
})
