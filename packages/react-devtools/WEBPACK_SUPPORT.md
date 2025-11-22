# React DevTools Webpack Support

基于 [unplugin](https://unplugin.unjs.io/) 实现的 React DevTools 插件现在同时支持 Vite 和 Webpack。

## 安装

```bash
pnpm add -D react-devtools
```

## 使用方法

### Webpack 配置

在 `webpack.config.js` 中：

```javascript
const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactDevToolsPlugin = require('react-devtools/webpack')

module.exports = {
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    ReactDevToolsPlugin({
      enabledEnvironments: ['development', 'test'],
    }),
  ],
  devServer: {
    port: 3004,
    hot: true,
  },
}
```

### 配置选项

```typescript
interface ReactDevToolsPluginOptions {
  /**
   * 在匹配的文件中追加 overlay 脚本
   * 如果不提供，脚本会自动注入到 index.html
   */
  appendTo?: string | RegExp

  /**
   * 在特定环境中启用 DevTools
   * - 不提供（默认）：开发模式启用，构建模式禁用
   * - true：与默认行为相同（开发模式启用，构建模式禁用）
   * - false：所有环境禁用
   * - 数组（如 ['development', 'test']）：在这些环境中启用（包括构建模式）
   */
  enabledEnvironments?: boolean | string[]
}
```

## 功能特性

✅ **HTML 注入**：自动在 HTML 中注入 DevTools overlay 脚本
✅ **开发服务器**：自动配置 `/__react_devtools__/` 端点
✅ **环境控制**：支持按环境启用/禁用
✅ **代码分割**：overlay 作为独立 chunk 打包
✅ **热更新**：支持 HMR

## 工作原理

插件使用 unplugin 的统一接口，实现了：

1. **Vite 特定钩子**：
   - `config` - 配置 Rollup 输入和输出
   - `configureServer` - 设置开发服务器中间件
   - `transformIndexHtml` - 注入 HTML 脚本

2. **Webpack 特定钩子**：
   - `webpack` - 配置 webpack compiler
   - 集成 HtmlWebpackPlugin 钩子注入脚本
   - 配置 devServer 中间件

3. **共享逻辑**：
   - `resolveId` - 解析虚拟模块
   - `load` - 加载 DevTools 选项
   - 环境检测和启用控制

## 与 Vite 插件的区别

- **API 相同**：配置选项完全一致
- **行为一致**：功能表现相同
- **代码复用**：核心逻辑共享

## 故障排除

### 插件未加载

确保已构建插件：

```bash
cd packages/react-devtools
pnpm build
```

### ESM/CommonJS 兼容性

如果遇到模块导入问题，可以：

1. 使用动态 import（Webpack 5 支持异步配置）：

```javascript
module.exports = async () => {
  const { webpack: ReactDevToolsPlugin } = await import('react-devtools/webpack')
  return {
    plugins: [
      ReactDevToolsPlugin({ enabledEnvironments: ['development'] }),
    ],
  }
}
```

2. 或使用同步 require（当前实现）：

```javascript
const ReactDevToolsPlugin = require('react-devtools/webpack').webpack
```

## 示例

查看 `packages/playground/react-webpack` 获取完整示例。
