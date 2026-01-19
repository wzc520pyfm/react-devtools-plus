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
        // ✨ 新 API: 独立打包的插件（推荐方式）
        // 插件使用 defineDevToolsPlugin() 定义，包含 __devtools_source__ 元数据
        {
          id: 'sample-plugin',
          title: 'Sample Plugin',
          icon: 'ph:puzzle-piece-fill',
          renderer: SamplePlugin,
        },
        // New API: Iframe plugin example
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
