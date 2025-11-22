import { createRpcClient, openInEditor } from '@react-devtools/kit'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import { ComponentsPage } from './pages/ComponentsPage'
import { OverviewPage } from './pages/OverviewPage'

function ComponentsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  )
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const navigate = useNavigate()

  return (
    <div
      className={`group relative cursor-pointer rounded-lg p-2 transition-colors ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
      onClick={() => navigate(to)}
    >
      <Icon className="h-6 w-6" />
      <div className="pointer-events-none absolute left-14 top-1/2 z-50 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity -translate-y-1/2 group-hover:opacity-100">
        {label}
      </div>
    </div>
  )
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tree, setTree] = useState<any>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    createRpcClient({
      updateTree(newTree: any) {
        setTree(newTree)
      },
      selectNode(fiberId: string) {
        setSelectedNodeId(fiberId)
        // Ensure we are on the components page
        if (location.pathname !== '/components') {
          navigate('/components')
        }
      },
      openInEditor(payload: { fileName: string, line: number, column: number }) {
        openInEditor(payload.fileName, payload.line, payload.column)
      },
    }, {
      preset: 'iframe',
    })

    window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/overview', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="h-screen w-full flex overflow-hidden bg-base text-base font-sans">
      {/* Sidebar */}
      <div className="z-50 w-12 flex flex-col items-center gap-2 border-r border-base bg-base py-4">
        <NavItem to="/overview" icon={ReactLogo} label="Overview" />
        <NavItem to="/components" icon={ComponentsIcon} label="Components" />
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0b0b]">
        <Routes>
          <Route path="/overview" element={<OverviewPage tree={tree} />} />
          <Route
            path="/components"
            element={(
              <ComponentsPage
                tree={tree}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            )}
          />
        </Routes>
      </div>
    </div>
  )
}
