# @react-devtools-plus/api

React DevTools Plus 插件开发 API。

本包提供创建 DevTools 插件所需的所有 API，包括插件定义、宿主脚本、视图通信等。

## 安装

```bash
npm install @react-devtools-plus/api
# or
pnpm add @react-devtools-plus/api
```

## 核心 API

### `defineDevToolsPlugin` - 定义插件

创建 DevTools 插件的主要入口。

```typescript
import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import type { DevToolsPluginProps } from '@react-devtools-plus/api'

// 插件面板组件
function MyPanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
  return (
    <div style={{ background: theme.mode === 'dark' ? '#1a1a1a' : '#fff' }}>
      <p>Selected: {selectedNodeId ?? 'None'}</p>
    </div>
  )
}

// 定义插件
export const MyPlugin = defineDevToolsPlugin({
  meta: {
    name: 'my-plugin',
    title: 'My Plugin',
    icon: 'lucide:puzzle',
    // npm 包信息（用于生产环境加载）
    packageName: '@my-org/devtools-plugin',
    viewExportName: 'MyPanel',
    bundlePath: 'dist/index.mjs',
  },
  view: {
    src: MyPanel,
  },
  defaultOptions: {
    enabled: true,
  },
})
```

**使用方式：**

```typescript
// vite.config.ts
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { MyPlugin } from '@my-org/devtools-plugin'

export default {
  plugins: [
    reactDevToolsPlus({
      plugins: [
        MyPlugin(),           // 默认配置
        MyPlugin({ enabled: false }), // 自定义配置
      ],
    }),
  ],
}
```

### `defineHostPlugin` - 定义宿主脚本

宿主脚本运行在宿主应用的主线程中，可以拦截网络请求、操作 DOM、与 DevTools UI 通信。

```typescript
// src/host.ts
import { defineHostPlugin } from '@react-devtools-plus/api'

const requests: Map<string, any> = new Map()

export default defineHostPlugin({
  name: 'network-inspector',

  // RPC 方法 - View 层可调用
  rpc: {
    getRequests() {
      return Array.from(requests.values())
    },
    clearRequests() {
      requests.clear()
    },
  },

  // 初始化逻辑
  setup(ctx) {
    // 获取用户配置
    const options = ctx.getOptions<{ maxRequests: number }>()

    // 拦截 fetch 请求
    ctx.network.onFetch({
      onRequest(request) {
        ctx.emit('request:start', { url: request.url })
      },
      onResponse(response, request) {
        ctx.emit('request:complete', {
          url: request.url,
          status: response.status,
        })
      },
    })

    // 返回清理函数
    return () => {
      requests.clear()
    }
  },
})
```

## View 层 Hooks

在插件面板组件中使用这些 Hooks 与宿主脚本通信。

### `usePluginRpc` - RPC 客户端

```typescript
import { usePluginRpc } from '@react-devtools-plus/api'

function MyPanel() {
  const rpc = usePluginRpc()

  const handleFetch = async () => {
    const data = await rpc.call('getRequests')
    console.log(data)
  }

  return <button onClick={handleFetch}>获取数据</button>
}
```

### `usePluginEvent` - 监听事件

```typescript
import { usePluginEvent } from '@react-devtools-plus/api'
import { useState } from 'react'

function MyPanel() {
  const [requests, setRequests] = useState([])

  // 监听宿主脚本发送的事件
  usePluginEvent('request:add', (request) => {
    setRequests(prev => [...prev, request])
  })

  return <div>{requests.length} 个请求</div>
}
```

### `usePluginOptions` - 获取插件选项

```typescript
import { usePluginOptions } from '@react-devtools-plus/api'

interface MyPluginOptions {
  maxItems: number
  showDebug: boolean
}

function MyPanel() {
  const options = usePluginOptions<MyPluginOptions>()

  return <div>最大条目: {options.maxItems}</div>
}
```

## 非 Hook API

在 React 组件外部使用。

### `createRpcClient` - 创建 RPC 客户端

```typescript
import { createRpcClient } from '@react-devtools-plus/api'

const rpc = createRpcClient('my-plugin')
const data = await rpc.call('getData')
```

### `getPluginOptions` - 获取选项

```typescript
import { getPluginOptions } from '@react-devtools-plus/api'

const options = getPluginOptions<MyOptions>('my-plugin')
```

## 完整插件示例

### 插件入口 (src/index.ts)

```typescript
import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import MyPanel from './Panel'

export interface MyPluginOptions {
  maxRequests?: number
  debug?: boolean
}

export const MyPlugin = defineDevToolsPlugin<MyPluginOptions>({
  meta: {
    name: 'my-plugin',
    title: 'My Plugin',
    icon: 'lucide:activity',
    packageName: '@my-org/my-plugin',
    viewExportName: 'MyPanel',
    bundlePath: 'dist/index.mjs',
  },
  view: {
    src: MyPanel,
  },
  // 宿主脚本
  host: {
    src: './src/host.ts',
    inject: 'head',  // 或使用函数精确控制
  },
  // 注入额外的 HTML 内容
  htmlInject: [
    {
      tag: 'link',
      attrs: { rel: 'stylesheet', href: '/my-plugin.css' },
      inject: 'head',
    },
  ],
  defaultOptions: {
    maxRequests: 100,
    debug: false,
  },
})

export { default as MyPanel } from './Panel'
```

### 宿主脚本 (src/host.ts)

```typescript
import { defineHostPlugin } from '@react-devtools-plus/api'
import type { MyPluginOptions } from './index'

const logs: string[] = []

export default defineHostPlugin({
  name: 'my-plugin',

  rpc: {
    getLogs: () => logs,
    clearLogs: () => { logs.length = 0 },
  },

  setup(ctx) {
    const options = ctx.getOptions<MyPluginOptions>()

    if (options.debug) {
      console.log('[MyPlugin] Debug mode enabled')
    }

    // 监听点击事件
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      logs.push(`Click: ${target.tagName}`)
      ctx.emit('log:add', { message: `Click: ${target.tagName}` })
    }

    document.addEventListener('click', handleClick)

    // 返回清理函数
    return () => {
      document.removeEventListener('click', handleClick)
    }
  },
})
```

### 面板组件 (src/Panel.tsx)

```typescript
import { usePluginRpc, usePluginEvent, usePluginOptions } from '@react-devtools-plus/api'
import type { DevToolsPluginProps } from '@react-devtools-plus/api'
import type { MyPluginOptions } from './index'
import { useState, useEffect } from 'react'

export default function MyPanel({ theme }: DevToolsPluginProps) {
  const rpc = usePluginRpc()
  const options = usePluginOptions<MyPluginOptions>()
  const [logs, setLogs] = useState<string[]>([])

  // 初始加载
  useEffect(() => {
    rpc.call<string[]>('getLogs').then(setLogs)
  }, [])

  // 监听新日志
  usePluginEvent('log:add', ({ message }) => {
    setLogs(prev => [...prev.slice(-options.maxRequests! + 1), message])
  })

  const handleClear = async () => {
    await rpc.call('clearLogs')
    setLogs([])
  }

  const isDark = theme.mode === 'dark'

  return (
    <div style={{
      padding: 16,
      background: isDark ? '#1a1a1a' : '#fff',
      color: isDark ? '#fff' : '#000',
    }}>
      <h2>My Plugin</h2>
      <button onClick={handleClear}>清空</button>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  )
}
```

## HTML 内容注入

除了宿主脚本，还可以注入任意 HTML 内容：

```typescript
export const MyPlugin = defineDevToolsPlugin({
  // ...
  htmlInject: [
    // 注入 importmap
    {
      tag: 'script',
      attrs: { type: 'importmap' },
      children: JSON.stringify({
        imports: { 'lodash': 'https://cdn.jsdelivr.net/npm/lodash-es/+esm' }
      }),
      inject: 'head-prepend',
    },

    // 注入样式表
    {
      tag: 'link',
      attrs: { rel: 'stylesheet', href: '/plugin.css' },
      inject: 'head',
    },

    // 使用函数精确定位
    {
      tag: 'meta',
      attrs: { name: 'plugin-version', content: '1.0.0' },
      inject: (html, content) => {
        return html.replace(/<head>/, `<head>\n${content}`)
      },
    },
  ],
})
```

## 注入位置

`inject` 选项控制脚本或 HTML 内容的注入位置：

### 简单字符串

| 值               | 说明                                |
| ---------------- | ----------------------------------- |
| `'head'`         | 在 `<head>` 末尾注入                |
| `'head-prepend'` | 在 `<head>` 开头注入（最早执行）    |
| `'body'`         | 在 `<body>` 末尾注入                |
| `'body-prepend'` | 在 `<body>` 开头注入                |
| `'idle'`         | 使用 `requestIdleCallback` 延迟注入 |

### 函数式注入

```typescript
inject: (html, content) => {
  // 在 React 脚本之后注入
  return html.replace(
    /(<script[^>]*src="[^"]*react[^"]*"[^>]*><\/script>)/i,
    `$1\n${content}`
  )
}
```

## 类型定义

### DevToolsPluginProps

插件面板组件接收的 Props：

```typescript
interface DevToolsPluginProps {
  /** 组件树数据 */
  tree: ComponentTreeNode | null
  /** 当前选中的节点 ID */
  selectedNodeId: string | null
  /** 主题配置 */
  theme: DevToolsTheme
}
```

### HostPluginContext

宿主脚本 setup 函数接收的上下文：

```typescript
interface HostPluginContext {
  /** 向 View 层发送事件 */
  emit: (eventName: string, data?: any) => void

  /** 获取插件选项 */
  getOptions: <T>() => T

  /** 网络拦截器 */
  network: {
    onFetch: (handler: FetchInterceptHandler) => () => void
    onXHR: (handler: XHRInterceptHandler) => () => void
    onResource: (handler: (entry: PerformanceResourceTiming) => void) => () => void
  }

  /** DevTools 能力 */
  devtools: {
    getTree: () => ComponentTreeNode | null
    getSelectedNodeId: () => string | null
    highlightNode: (fiberId: string) => void
    hideHighlight: () => void
  }
}
```

### PluginRpcClient

RPC 客户端接口：

```typescript
interface PluginRpcClient {
  /** 调用宿主脚本的 RPC 方法 */
  call: <T = any>(method: string, ...args: any[]) => Promise<T>

  /** 监听宿主脚本发送的事件 */
  on: (eventName: string, handler: (data: any) => void) => () => void

  /** 一次性监听事件 */
  once: (eventName: string, handler: (data: any) => void) => () => void
}
```

## 网络拦截

宿主脚本可以拦截和监控网络请求：

```typescript
setup(ctx) {
  // 拦截 fetch 请求
  ctx.network.onFetch({
    onRequest(request) {
      // 请求发送前
      console.log('Fetch:', request.url)
    },
    onResponse(response, request) {
      // 响应接收后
      console.log('Response:', response.status)
    },
    onError(error, request) {
      // 请求失败
      console.error('Error:', error)
    },
  })

  // 拦截 XHR 请求
  ctx.network.onXHR({
    onOpen(method, url, xhr) {
      console.log('XHR:', method, url)
    },
    onSend(body, xhr) {
      console.log('XHR send:', body)
    },
    onLoad(xhr) {
      console.log('XHR complete:', xhr.status)
    },
  })

  // 监控资源加载
  ctx.network.onResource((entry) => {
    console.log('Resource:', entry.name, entry.duration)
  })
}
```

## 许可证

MIT
