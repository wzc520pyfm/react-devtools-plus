import { SamplePlugin } from '@react-devtools-plus/sample-plugin'
// 导入独立打包的插件
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

        // ✨ 扩展配置：覆盖插件选项
        // 使用 extend 格式可以覆盖名称、标题、注入位置等
        // {
        //   extend: SamplePlugin,
        //   name: 'custom-sample',        // 覆盖名称（避免冲突）
        //   title: 'Custom Sample',       // 覆盖标题
        //   host: { inject: 'head-prepend' },  // 覆盖注入位置
        //   options: { showDebug: true }, // 覆盖选项
        // },

        // ✨ 旧 API：对象格式（仍然支持）
        // 本地插件使用字符串路径，由 Vite 处理热更新
        // 这个配置测试不打包模式下的完整插件功能
        // {
        //   name: 'my-plugin',
        //   title: 'My Plugin',
        //   icon: 'lucide:puzzle',
        //   view: { src: './src/plugins/MyPlugin.tsx' },
        //   // 宿主脚本配置 - 测试不打包模式
        //   host: {
        //     src: './src/plugins/host.ts',
        //     inject: 'body',
        //   },
        //   // 插件选项
        //   options: {
        //     showDebug: true,
        //   },
        // },

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
