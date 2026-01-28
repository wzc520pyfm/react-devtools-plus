/**
 * React DevTools Plus - Umi Plugin (Qiankun Sub App)
 *
 * 子应用配置：
 * - 嵌入主应用时使用 'child' 模式，避免创建重复的 DevTools
 * - 独立运行时使用 'standalone' 模式，可以正常使用 DevTools
 */
import { createUmiPlugin } from 'react-devtools-plus/umi'

// 检测是否为独立运行模式
const isStandalone = process.env.STANDALONE === 'true'

export default createUmiPlugin({
  // 微前端模式：根据环境选择
  // - 独立运行时: 'standalone' - 总是初始化 DevTools
  // - 嵌入主应用时: 'child' - 如果主应用已有 DevTools 则跳过
  microFrontend: isStandalone ? 'standalone' : 'child',

  enabledEnvironments: ['development', 'test'],

  scan: {
    enabled: true,
    showToolbar: false,
    animationSpeed: 'fast',
  },

  theme: {
    mode: 'dark',
    primaryColor: 'green', // 子应用使用绿色主题，便于区分
  },

  launchEditor: 'cursor',
})
