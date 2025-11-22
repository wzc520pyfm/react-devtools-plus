# React DevTools 环境控制指南

## 概述

React DevTools 支持根据不同的构建环境来控制是否渲染。默认情况下，DevTools 仅在开发服务器模式（`vite dev`）下启用，在生产构建（`vite build`）下禁用。

如果你需要在特定环境（如 dev、test）中启用 DevTools，而在其他环境（如 staging、production）中禁用，可以使用以下方法。

## 方法一：插件配置选项（推荐）

在 `vite.config.ts` 中配置插件的 `enabledEnvironments` 选项：

```typescript
import react from '@vitejs/plugin-react'
import reactDevtools from 'react-devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    reactDevtools({
      // 只在 dev 和 test 环境启用
      enabledEnvironments: ['development', 'test'],
    }),
  ],
})
```

### 配置选项说明

- **不配置**（默认行为）
  - 开发模式（`vite dev`）：始终启用
  - 构建模式（`vite build`）：始终禁用
  - 等同于原来的 `apply: 'serve'` 行为

- `enabledEnvironments: true`
  - 与默认行为相同（开发模式启用，构建模式禁用）

- `enabledEnvironments: false`
  - 所有环境都禁用（包括开发模式）

- `enabledEnvironments: ['development', 'test']`
  - 在指定的环境中启用（包括构建模式）
  - 环境通过 `NODE_ENV` 或 `--mode` 参数确定
  - 例如：`vite build --mode test` 会启用 DevTools

## 方法二：环境变量

通过环境变量 `VITE_REACT_DEVTOOLS_ENABLED` 控制（优先级最高）：

### 方式 1：在 `.env` 文件中设置

```bash
# .env.development
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.test
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.staging
VITE_REACT_DEVTOOLS_ENABLED=false

# .env.production
VITE_REACT_DEVTOOLS_ENABLED=false
```

### 方式 2：在命令行中设置

```bash
# 开发环境
VITE_REACT_DEVTOOLS_ENABLED=true vite dev

# 测试环境构建
VITE_REACT_DEVTOOLS_ENABLED=true vite build --mode test

# 生产环境构建
VITE_REACT_DEVTOOLS_ENABLED=false vite build --mode production
```

## 方法三：构建时模式

使用 Vite 的 `--mode` 参数配合环境变量文件：

```bash
# 开发环境（自动加载 .env.development）
vite dev

# 测试环境构建（加载 .env.test）
vite build --mode test

# 预发布环境构建（加载 .env.staging）
vite build --mode staging

# 生产环境构建（加载 .env.production）
vite build --mode production
```

在对应的 `.env.*` 文件中设置：

```bash
# .env.test
NODE_ENV=test
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.staging
NODE_ENV=staging
VITE_REACT_DEVTOOLS_ENABLED=false

# .env.production
NODE_ENV=production
VITE_REACT_DEVTOOLS_ENABLED=false
```

## 工作原理

### 构建时控制（插件级别）

1. **插件 `apply` 函数**：根据配置和环境决定插件是否应用

   ```typescript
   const plugin = {
     apply(config, env) {
       return shouldEnableDevTools(
         pluginOptions.enabledEnvironments,
         env.mode || config.mode || 'development',
         env.command,
       )
     }
   }
   ```

2. **HTML 注入**：如果插件应用，`transformIndexHtml` 钩子会在 HTML 中注入脚本
3. **脚本不注入**：如果插件不应用，HTML 中不会有 DevTools 脚本

### 运行时控制（双重保险）

即使脚本被注入，`main.tsx` 中也有运行时检查：

```typescript
function shouldRenderDevTools(): boolean {
  // 检查环境变量
  if (import.meta.env.VITE_REACT_DEVTOOLS_ENABLED !== undefined) {
    return import.meta.env.VITE_REACT_DEVTOOLS_ENABLED === 'true'
  }

  // 检查 mode 和 blocked/allowed 列表
  const mode = import.meta.env.MODE
  // ...
}
```

## 示例配置

### 场景：只在 dev 和 test 环境启用

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    reactDevtools({
      enabledEnvironments: ['development', 'test'],
    }),
  ],
})
```

### 场景：完全禁用

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    reactDevtools({
      enabledEnvironments: false,
    }),
  ],
})
```

### 场景：使用环境变量文件

```bash
# .env.development
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.test
VITE_REACT_DEVTOOLS_ENABLED=true

# .env.staging
VITE_REACT_DEVTOOLS_ENABLED=false

# .env.production
VITE_REACT_DEVTOOLS_ENABLED=false
```

## 优先级

环境控制的优先级（从高到低）：

1. **环境变量** `VITE_REACT_DEVTOOLS_ENABLED`（最高优先级）
2. **插件配置** `enabledEnvironments`
3. **默认行为**（dev 模式启用，build 模式检查环境）

## 验证

构建后可以通过以下方式验证：

1. **检查 HTML**：查看构建后的 `index.html`，不应包含 DevTools 脚本标签
2. **检查 Bundle**：DevTools 代码不应出现在构建产物中
3. **运行时检查**：即使脚本被注入，运行时检查也会阻止渲染

## 注意事项

- 环境变量必须以 `VITE_` 开头才能在客户端代码中使用
- `NODE_ENV` 由 Vite 自动设置，但可以通过 `--mode` 覆盖
- 插件的 `apply` 函数在构建时执行，确保不会包含不需要的代码
- 运行时的 `shouldRenderDevTools` 检查提供了额外的安全保障
