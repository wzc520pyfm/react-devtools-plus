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
        // ✨ 新 API：可调用格式（推荐）
        // 所有配置内置于插件中，用户只需调用即可
        SamplePlugin(),

        // 也可以传入选项覆盖默认值
        // SamplePlugin({ showDebug: true }),

        // ✨ 旧 API：对象格式（仍然支持）
        // 本地插件使用字符串路径，由 Vite 处理热更新
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
