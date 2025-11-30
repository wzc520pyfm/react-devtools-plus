import React from 'react'

// We need to import the types from the client package or define them locally if not exported
// For now, we'll define a compatible interface
interface DevToolsPluginContext {
  tree: any
  selectedNodeId: string | null
  theme: any
}

export default function ContextInspector(props: DevToolsPluginContext) {
  const { tree, selectedNodeId, theme } = props

  return (
    <div className="h-full flex flex-col overflow-auto p-4">
      <h1 className="mb-4 text-xl font-bold">My DevTools Inspector</h1>

      <div className="grid grid-cols-1 gap-4">
        {/* Theme Info */}
        <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 font-semibold">Theme Context</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <span className="rounded bg-gray-100 px-2 py-1 text-sm font-mono dark:bg-gray-700">
              {theme?.mode || 'unknown'}
            </span>
          </div>
        </div>

        {/* Selection Info */}
        <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 font-semibold">Selected Node</h2>
          {selectedNodeId
            ? (
                <div>
                  <div className="mb-1 text-sm text-gray-500">
                    ID:
                    {' '}
                    <span className="text-black font-mono dark:text-white">{selectedNodeId}</span>
                  </div>
                  <p className="text-xs text-gray-400">Select components in the tree to see updates here.</p>
                </div>
              )
            : (
                <p className="text-sm text-gray-400 italic">No component selected</p>
              )}
        </div>

        {/* Tree Info */}
        <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 font-semibold">Tree Stats</h2>
          <div className="text-sm">
            {tree
              ? (
                  <p>
                    Tree data available (root ID:
                    {' '}
                    {tree.rootID || 'unknown'}
                    )
                  </p>
                )
              : (
                  <p className="text-gray-400 italic">Waiting for tree data...</p>
                )}
          </div>
        </div>

        {/* Raw Context JSON */}
        <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
          <h2 className="mb-2 font-semibold">Raw Context Data</h2>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900" style={{ maxHeight: '350px' }}>
            {JSON.stringify(props, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
