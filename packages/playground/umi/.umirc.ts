import { defineConfig } from 'umi'

export default defineConfig({
  // 路由配置
  routes: [
    { path: '/', component: 'index' },
    { path: '/about', component: 'about' },
    { path: '/theme', component: 'theme' },
    { path: '/counter', component: 'counter' },
  ],

  // umi 会自动加载项目根目录下的 plugin.ts 文件
  // 无需在 plugins 中手动配置

  // 开发服务器配置
  devtool: 'source-map',

  // 禁用 MFSU 以便更好地测试 react-devtools-plus
  // 你可以根据需要启用
  mfsu: false,

  // 其他 umi 配置
  npmClient: 'pnpm',
  title: 'React DevTools Plus - Umi Playground',
})
