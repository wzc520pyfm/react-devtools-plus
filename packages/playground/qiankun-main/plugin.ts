/**
 * React DevTools Plus - Umi Plugin (Qiankun Main App)
 *
 * 主应用配置：使用 'host' 模式，确保 DevTools 在主应用中初始化
 */
import { createUmiPlugin } from 'react-devtools-plus/umi'

export default createUmiPlugin({
  // 微前端模式：主应用使用 'host'
  microFrontend: 'host',

  enabledEnvironments: ['development', 'test'],

  scan: {
    enabled: true,
    showToolbar: false,
    animationSpeed: 'fast',
  },

  theme: {
    mode: 'dark',
    primaryColor: 'orange',
  },

  launchEditor: 'cursor',
})
