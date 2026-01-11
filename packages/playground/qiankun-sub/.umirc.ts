import { defineConfig } from '@umijs/max'

export default defineConfig({
  // 路由配置
  routes: [
    { path: '/', component: 'index' },
    { path: '/detail', component: 'detail' },
  ],

  // 启用 qiankun 子应用模式
  qiankun: {
    slave: {},
  },

  // 开发服务器配置
  devtool: 'source-map',

  // 禁用 MFSU 以便更好地测试
  mfsu: false,

  npmClient: 'pnpm',
  title: 'Qiankun Sub App - React DevTools Plus',
})
