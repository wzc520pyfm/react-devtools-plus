/**
 * Sample Plugin Panel Component
 * 示例插件面板组件
 */

import type { DevToolsPluginProps } from '@react-devtools-plus/api'

export default function SamplePanel({ tree, selectedNodeId, theme }: DevToolsPluginProps) {
  return (
    <div className="h-full flex flex-col overflow-auto p-4">
      <h1 className="mb-4 text-xl font-bold">🔌 Sample Plugin</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        这是一个独立打包的插件示例，展示了新的插件 API 设计。
      </p>

      <div className="grid grid-cols-1 gap-4">
        {/* Theme Info */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 text-primary-600 font-semibold dark:text-primary-400">
            🎨 主题信息
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <span className="rounded bg-gray-100 px-2 py-1 text-sm font-mono dark:bg-gray-700">
              {theme?.mode || 'unknown'}
            </span>
          </div>
        </div>

        {/* Selection Info */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 text-primary-600 font-semibold dark:text-primary-400">
            🎯 选中节点
          </h2>
          {selectedNodeId
            ? (
                <div>
                  <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">
                    {selectedNodeId}
                  </code>
                </div>
              )
            : (
                <p className="text-sm text-gray-400 italic">未选中任何组件</p>
              )}
        </div>

        {/* Tree Stats */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 text-primary-600 font-semibold dark:text-primary-400">
            🌳 组件树
          </h2>
          {tree
            ? (
                <p className="text-sm">
                  Root ID:
                  {' '}
                  <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
                    {tree.rootID || 'N/A'}
                  </code>
                </p>
              )
            : (
                <p className="text-sm text-gray-400 italic">等待组件树数据...</p>
              )}
        </div>

        {/* About */}
        <div className="border border-gray-300 rounded-lg border-dashed p-4 dark:border-gray-600">
          <h2 className="mb-2 font-semibold">📦 关于此插件</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
            <li>使用 defineDevToolsPlugin() 定义</li>
            <li>预打包为 ESM 格式</li>
            <li>React 作为 peerDependency 外部化</li>
            <li>支持 Iconify 图标格式</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
