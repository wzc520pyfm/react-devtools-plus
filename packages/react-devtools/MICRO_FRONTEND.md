# React DevTools 微前端集成指南

## 概述

React DevTools Plus 提供了完善的微前端支持，可以在 qiankun、single-spa、micro-app 等微前端框架中正常工作。通过合理的配置，可以避免父子应用同时渲染 DevTools 导致的冲突问题。

## 核心配置选项

### microFrontend

控制 DevTools 在微前端架构中的行为模式：

```typescript
import ReactDevTools from 'react-devtools-plus'

ReactDevTools({
  microFrontend: 'auto' | 'host' | 'child' | 'standalone'
})
```

| 模式           | 描述                                       | 使用场景                 |
| -------------- | ------------------------------------------ | ------------------------ |
| `'auto'`       | 自动检测，如果已存在 DevTools 则跳过初始化 | 默认值，适用于大多数场景 |
| `'host'`       | 主应用/基座模式，总是初始化 DevTools       | 微前端架构中的父应用     |
| `'child'`      | 子应用模式，如果已有 DevTools 则跳过       | 微前端架构中的子应用     |
| `'standalone'` | 独立模式，忽略其他实例总是初始化           | 子应用独立开发调试时     |

### clientUrl

指定 DevTools 客户端面板的 URL，用于跨域或不同端口的场景：

```typescript
ReactDevTools({
  clientUrl: 'http://localhost:8080/__react_devtools__/'
})
```

### rootSelector

指定要检测的 React 应用根容器，用于多个 React 应用共存的场景：

```typescript
ReactDevTools({
  rootSelector: '#sub-app-root'
})
```

## 快速开始

### 推荐配置方案

**方案一：只在父应用安装 DevTools（最简单）**

```typescript
// 父应用 vite.config.ts
import ReactDevTools from 'react-devtools-plus'

export default {
  plugins: [
    ReactDevTools({
      microFrontend: 'host'
    })
  ]
}

// 子应用：不安装 react-devtools-plus
```

优点：配置简单，无冲突风险
缺点：子应用独立开发时没有 DevTools

---

**方案二：父子应用都安装（推荐）**

```typescript
// 父应用 vite.config.ts
import ReactDevTools from 'react-devtools-plus'

export default {
  plugins: [
    ReactDevTools({
      microFrontend: 'host'  // 父应用负责初始化 DevTools
    })
  ]
}

// 子应用 vite.config.ts
import ReactDevTools from 'react-devtools-plus'

export default {
  plugins: [
    ReactDevTools({
      microFrontend: 'child',     // 检测到已有 DevTools 时跳过
      rootSelector: '#sub-app',   // 可选：限制检测范围
    })
  ]
}
```

优点：子应用独立开发时也有 DevTools
缺点：需要配置两处

## 框架集成示例

### qiankun

**主应用配置：**

```typescript
// main-app/vite.config.ts
import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    ReactDevTools({
      microFrontend: 'host',
      theme: { mode: 'auto' }
    })
  ]
})
```

**子应用配置：**

```typescript
// sub-app/vite.config.ts
import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

// 检测是否在 qiankun 环境中运行
const isQiankun = !!process.env.QIANKUN || process.env.npm_lifecycle_event?.includes('qiankun')

export default defineConfig({
  plugins: [
    react(),
    ReactDevTools({
      // 嵌入主应用时用 child，独立运行时用 standalone
      microFrontend: isQiankun ? 'child' : 'standalone',
      rootSelector: '#sub-app-container'
    })
  ]
})
```

**子应用入口文件：**

```typescript
// sub-app/src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

let root: ReturnType<typeof createRoot> | null = null

// qiankun 生命周期
export async function bootstrap() {
  console.log('Sub app bootstrapped')
}

export async function mount(props: any) {
  const container = props.container?.querySelector('#sub-app-container')
    || document.getElementById('sub-app-container')

  root = createRoot(container!)
  root.render(<App />)
}

export async function unmount() {
  root?.unmount()
  root = null
}

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  const container = document.getElementById('root')!
  createRoot(container).render(<App />)
}
```

---

### single-spa

**Root Config（主应用）：**

```typescript
// root-config/vite.config.ts
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools({
      microFrontend: 'host'
    })
  ]
})
```

**Parcel（子应用）：**

```typescript
// parcel-app/vite.config.ts
import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    ReactDevTools({
      microFrontend: 'child',
      // single-spa 通常挂载到特定容器
      rootSelector: '#single-spa-application\\:@org\\/app-name'
    })
  ]
})
```

---

### micro-app

**主应用配置：**

```typescript
// main-app/vite.config.ts
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools({
      microFrontend: 'host'
    })
  ]
})
```

**子应用配置：**

```typescript
// sub-app/vite.config.ts
import ReactDevTools from 'react-devtools-plus'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools({
      microFrontend: 'child',
      // micro-app 使用 Shadow DOM，子应用可能需要独立 DevTools
      // 如果父应用 DevTools 无法检测子应用，可改为 'standalone'
    })
  ]
})
```

---

### Webpack 项目（Create React App / Umi）

**主应用（Webpack）：**

```javascript
// main-app/config-overrides.js (react-app-rewired)
const ReactDevTools = require('react-devtools-plus/webpack')

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      ReactDevTools({
        microFrontend: 'host'
      })
    )
    return config
  }
}
```

**子应用（Umi）：**

```typescript
// sub-app/.umirc.ts
import { createUmiPlugin } from 'react-devtools-plus/umi'

export default {
  plugins: [
    createUmiPlugin({
      microFrontend: 'child',
      rootSelector: '#sub-app-root'
    })
  ]
}
```

## 常见场景

### 场景一：本地开发子应用 + 线上父应用

当你需要访问线上/测试环境的父应用，同时将子应用资源代理到本地时：

```typescript
// 子应用 vite.config.ts
import ReactDevTools from 'react-devtools-plus'

export default {
  server: {
    port: 5173,
    cors: true
  },
  plugins: [
    ReactDevTools({
      microFrontend: 'child',
      // 指向本地开发服务器的 DevTools 客户端
      clientUrl: 'http://localhost:5173/__react_devtools__/',
      rootSelector: '#sub-app-root'
    })
  ]
}
```

此配置下：

- 如果线上父应用有 DevTools，子应用会跳过初始化
- 如果线上父应用没有 DevTools，子应用会使用本地的 DevTools

### 场景二：多个子应用同时开发

当同时开发多个子应用时，每个子应用都配置为 `child` 模式：

```typescript
// 子应用 A
ReactDevTools({
  microFrontend: 'child',
  rootSelector: '#app-a-root'
})

// 子应用 B
ReactDevTools({
  microFrontend: 'child',
  rootSelector: '#app-b-root'
})
```

只有第一个加载的子应用（且没有父应用 DevTools）会初始化 DevTools。

### 场景三：子应用独立开发

当子应用需要完全独立开发调试时：

```typescript
// 子应用 vite.config.ts
const isStandalone = process.env.STANDALONE === 'true'

export default {
  plugins: [
    ReactDevTools({
      microFrontend: isStandalone ? 'standalone' : 'child'
    })
  ]
}
```

启动命令：

```bash
# 独立开发模式
STANDALONE=true npm run dev

# 嵌入父应用模式
npm run dev
```

## 工作原理

### 检测机制

DevTools 通过以下方式检测是否已有实例存在：

1. **DOM 检测**：检查 `#react-devtools-overlay` 元素是否存在
2. **全局标记**：检查 `window.__REACT_DEVTOOLS_PLUS_INITIALIZED__` 变量

### 模式决策流程

```
┌─────────────────┐
│  microFrontend  │
│     mode?       │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ host  │ │ child │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────────┐ ┌────────────────┐
│ 检查 DOM  │ │ 检查 DOM +      │
│ 防止重复   │ │ 全局标记        │
│ 挂载      │ │ 存在则跳过       │
└───────────┘ └────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│  auto  │ │ standalone │
└───┬────┘ └─────┬──────┘
    │            │
    ▼            ▼
┌────────────┐ ┌────────────┐
│ 同 child   │ │ 仅检查 DOM  │
│ 自动检测    │ │ 总是初始化   │
└────────────┘ └────────────┘
```

## 故障排查

### 问题：出现两个 DevTools 面板

**原因**：父子应用都配置为 `host` 或 `standalone`

**解决**：

- 父应用使用 `microFrontend: 'host'`
- 子应用使用 `microFrontend: 'child'`

### 问题：子应用独立运行时没有 DevTools

**原因**：子应用配置为 `child` 模式，但独立运行时检测到了残留的全局标记

**解决**：

```typescript
// 根据环境动态选择模式
const isEmbedded = !!(window as any).__POWERED_BY_QIANKUN__

ReactDevTools({
  microFrontend: isEmbedded ? 'child' : 'standalone'
})
```

### 问题：DevTools 无法检测子应用的组件

**可能原因**：

1. 子应用使用了 Shadow DOM 隔离
2. React 版本不兼容
3. 子应用在 DevTools 初始化后才挂载

**解决**：

1. 尝试在子应用配置 `standalone` 模式
2. 确保父子应用使用兼容的 React 版本
3. 检查组件树面板，等待子应用完全加载后刷新

### 问题：clientUrl 跨域报错

**原因**：DevTools 客户端 iframe 受跨域限制

**解决**：
确保开发服务器配置了正确的 CORS：

```typescript
// vite.config.ts
export default {
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

## 最佳实践总结

1. **父应用优先**：在微前端架构中，优先在父应用安装 DevTools
2. **明确模式**：不要依赖 `auto`，显式指定 `host` 或 `child`
3. **指定 rootSelector**：在子应用中指定 `rootSelector` 限制检测范围
4. **环境区分**：通过环境变量区分独立开发和嵌入模式
5. **版本一致**：尽量保持父子应用的 `react-devtools-plus` 版本一致

## 参考链接

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [single-spa 官方文档](https://single-spa.js.org/)
- [micro-app 官方文档](https://micro-zoe.github.io/micro-app/)
