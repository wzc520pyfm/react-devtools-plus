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
          id: 'sample-plugin',
          title: 'Sample Plugin',
          icon: 'ph:puzzle-piece-fill',
          renderer: SamplePlugin,
        },
        // ✨ 本地插件（推荐用于开发）
        // 使用字符串路径，由 Vite 处理热更新
        {
          id: 'my-plugin',
          title: 'My Plugin',
          icon: 'lucide:puzzle',
          renderer: './src/plugins/MyPlugin.tsx',
        },
        // ✨ Iframe 插件
        {
          id: 'external-docs',
          type: 'iframe',
          title: 'React Docs',
          icon: 'ph:book-open-fill',
          url: 'https://react.dev',
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
