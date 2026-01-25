import { CheckCircle, Info, Puzzle } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CodeBlock } from '../../components/ui/CodeBlock'

export const Plugins: React.FC = () => {
  const { t } = useTranslation()

  const installCode = `npm install @react-devtools-plus/api
# or
pnpm add @react-devtools-plus/api`

  const definePluginCode = `import { defineDevToolsPlugin } from '@react-devtools-plus/api'
import type { DevToolsPluginProps } from '@react-devtools-plus/api'

// Plugin panel component
function MyPanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
  return (
    <div style={{ background: theme.mode === 'dark' ? '#1a1a1a' : '#fff' }}>
      <p>Selected: {selectedNodeId ?? 'None'}</p>
    </div>
  )
}

// Define plugin
export const MyPlugin = defineDevToolsPlugin({
  meta: {
    name: 'my-plugin',
    title: 'My Plugin',
    icon: 'lucide:puzzle',
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
})`

  const usePluginCode = `// vite.config.ts
import { reactDevToolsPlus } from 'react-devtools-plus/vite'
import { MyPlugin } from '@my-org/devtools-plugin'

export default {
  plugins: [
    reactDevToolsPlus({
      plugins: [
        MyPlugin(),                    // Default config
        MyPlugin({ enabled: false }),  // Custom config
      ],
    }),
  ],
}`

  const hostPluginCode = `// src/host.ts
import { defineHostPlugin } from '@react-devtools-plus/api'

const requests: Map<string, any> = new Map()

export default defineHostPlugin({
  name: 'network-inspector',

  // RPC methods - callable from View layer
  rpc: {
    getRequests() {
      return Array.from(requests.values())
    },
    clearRequests() {
      requests.clear()
    },
  },

  // Initialization logic
  setup(ctx) {
    const options = ctx.getOptions<{ maxRequests: number }>()

    // Intercept fetch requests
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

    // Return cleanup function
    return () => {
      requests.clear()
    }
  },
})`

  const viewHooksCode = `import { usePluginRpc, usePluginEvent, usePluginOptions } from '@react-devtools-plus/api'
import { useState, useEffect } from 'react'

function MyPanel() {
  const rpc = usePluginRpc()
  const options = usePluginOptions<{ maxItems: number }>()
  const [logs, setLogs] = useState<string[]>([])

  // Initial load
  useEffect(() => {
    rpc.call<string[]>('getLogs').then(setLogs)
  }, [])

  // Listen for new logs from host
  usePluginEvent('log:add', ({ message }) => {
    setLogs(prev => [...prev.slice(-options.maxItems + 1), message])
  })

  const handleClear = async () => {
    await rpc.call('clearLogs')
    setLogs([])
  }

  return (
    <div>
      <button onClick={handleClear}>Clear</button>
      <ul>
        {logs.map((log, i) => <li key={i}>{log}</li>)}
      </ul>
    </div>
  )
}`

  const fullExampleCode = `// src/index.ts - Plugin entry
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
  // Host script
  host: {
    src: './src/host.ts',
    inject: 'head',
  },
  // Inject additional HTML content
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

export { default as MyPanel } from './Panel'`

  const injectPositions = [
    { value: 'head', description: t('docs.plugins.inject.head') },
    { value: 'head-prepend', description: t('docs.plugins.inject.headPrepend') },
    { value: 'body', description: t('docs.plugins.inject.body') },
    { value: 'body-prepend', description: t('docs.plugins.inject.bodyPrepend') },
    { value: 'idle', description: t('docs.plugins.inject.idle') },
  ]

  const contextMethods = [
    { method: 'emit(eventName, data?)', description: t('docs.plugins.context.emit') },
    { method: 'getOptions<T>()', description: t('docs.plugins.context.getOptions') },
    { method: 'network.onFetch(handler)', description: t('docs.plugins.context.onFetch') },
    { method: 'network.onXHR(handler)', description: t('docs.plugins.context.onXHR') },
    { method: 'network.onResource(handler)', description: t('docs.plugins.context.onResource') },
    { method: 'devtools.getTree()', description: t('docs.plugins.context.getTree') },
    { method: 'devtools.highlightNode(id)', description: t('docs.plugins.context.highlightNode') },
  ]

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-4 text-4xl text-white font-bold">{t('docs.plugins.title')}</h1>

      <p className="text-lg text-slate-300 leading-relaxed">
        {t('docs.plugins.description')}
      </p>

      <div className="not-prose my-8 border border-white/10 rounded-2xl bg-white/5 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-brand-500/20 rounded-xl p-3">
            <Puzzle className="text-brand-400 h-6 w-6" />
          </div>
          <div>
            <h2 className="mb-2 text-xl text-white font-semibold">{t('docs.plugins.whatIs.title')}</h2>
            <p className="text-slate-300 leading-relaxed">
              {t('docs.plugins.whatIs.description')}
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.plugins.features.title')}</h2>
      <ul className="my-6 space-y-3">
        {(t('docs.plugins.features.items', { returnObjects: true }) as string[]).map(item => (
          <li key={item} className="flex items-start gap-3 text-slate-300">
            <CheckCircle className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 mt-8 text-2xl text-white font-bold">{t('docs.plugins.install.title')}</h2>
      <p className="text-slate-300">{t('docs.plugins.install.description')}</p>
      <CodeBlock code={installCode} language="bash" title="Install" />

      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.plugins.definePlugin.title')}</h2>
      <p className="text-slate-300">{t('docs.plugins.definePlugin.description')}</p>
      <CodeBlock code={definePluginCode} language="typescript" title="defineDevToolsPlugin" />

      <h3 className="mb-4 mt-8 text-xl text-white font-bold">{t('docs.plugins.usage.title')}</h3>
      <p className="text-slate-300">{t('docs.plugins.usage.description')}</p>
      <CodeBlock code={usePluginCode} language="typescript" title="vite.config.ts" />

      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.plugins.hostPlugin.title')}</h2>
      <p className="text-slate-300">{t('docs.plugins.hostPlugin.description')}</p>
      <CodeBlock code={hostPluginCode} language="typescript" title="Host Plugin" />

      <h3 className="mb-4 mt-8 text-xl text-white font-bold">{t('docs.plugins.context.title')}</h3>
      <p className="mb-4 text-slate-300">{t('docs.plugins.context.description')}</p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.option')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.common.description')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contextMethods.map(item => (
              <tr key={item.method}>
                <td className="text-brand-400 py-3 pr-4 text-sm font-mono">{item.method}</td>
                <td className="py-3 text-slate-300">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.plugins.viewHooks.title')}</h2>
      <p className="text-slate-300">{t('docs.plugins.viewHooks.description')}</p>
      <CodeBlock code={viewHooksCode} language="typescript" title="View Layer Hooks" />

      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.plugins.inject.title')}</h2>
      <p className="mb-4 text-slate-300">{t('docs.plugins.inject.description')}</p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-slate-300 font-semibold">{t('docs.common.value')}</th>
              <th className="py-3 text-slate-300 font-semibold">{t('docs.common.behavior')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {injectPositions.map(item => (
              <tr key={item.value}>
                <td className="text-brand-400 py-3 pr-4 text-sm font-mono">{item.value}</td>
                <td className="py-3 text-slate-300">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-10 text-2xl text-white font-bold">{t('docs.plugins.fullExample.title')}</h2>
      <p className="text-slate-300">{t('docs.plugins.fullExample.description')}</p>
      <CodeBlock code={fullExampleCode} language="typescript" title="Complete Plugin Example" />

      <div className="not-prose my-6 border border-blue-500/30 rounded-xl bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div>
            <p className="text-sm text-blue-300 font-medium">{t('docs.plugins.tip.title')}</p>
            <p className="mt-1 text-sm text-blue-300/80">{t('docs.plugins.tip.content')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
