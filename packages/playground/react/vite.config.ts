// 导入独立打包的插件
import { SamplePlugin } from '@react-devtools-plus/sample-plugin'
import react from '@vitejs/plugin-react'
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    reactDevToolsPlus({
      // enabledEnvironments: ['development', 'test'],
      plugins: [
        // ✨ 独立打包的插件（推荐用于发布）
        // 插件使用 defineDevToolsPlugin() 定义，包含 __devtools_source__ 元数据
        {
          name: 'sample-plugin',
          title: 'Sample Plugin',
          icon: 'ph:puzzle-piece-fill',
          view: { src: SamplePlugin },
        },
        // ✨ 本地插件（推荐用于开发）
        // 使用字符串路径，由 Vite 处理热更新
        {
          name: 'my-plugin',
          title: 'My Plugin',
          icon: 'lucide:puzzle',
          view: { src: './src/plugins/MyPlugin.tsx' },
        },
        // ✨ Iframe 插件
        // type 可省略，会自动检测 http/https URL
        {
          name: 'external-docs',
          title: 'React Docs',
          icon: 'ph:book-open-fill',
          view: { type: 'iframe', src: 'https://react.dev' },
        },
      ],
      // Enable React Scan auto-injection
      scan: {
        enabled: true,
        showToolbar: false,
        animationSpeed: 'fast',
      },
    }),
    react(),
  ],
})
