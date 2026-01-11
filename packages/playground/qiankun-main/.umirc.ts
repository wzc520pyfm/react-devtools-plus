import { defineConfig } from '@umijs/max'

export default defineConfig({
  // 路由配置
  routes: [
    { path: '/', component: 'index' },
    { path: '/about', component: 'about' },
    // 子应用挂载路由
    { path: '/sub/*', component: 'sub-app' },
  ],

  // 启用 qiankun 主应用模式
  qiankun: {
    master: {
      apps: [
        {
          name: 'sub-app',
          entry: '//localhost:8001',
        },
      ],
    },
  },

  // 开发服务器配置
  devtool: 'source-map',

  // 禁用 MFSU 以便更好地测试
  mfsu: false,

  npmClient: 'pnpm',
  title: 'Qiankun Main App - React DevTools Plus',
})
