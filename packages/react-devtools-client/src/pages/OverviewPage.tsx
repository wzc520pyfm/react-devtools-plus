import type { ComponentTreeNode } from '@react-devtools/kit'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import pkg from '../../package.json'

interface OverviewPageProps {
  tree: ComponentTreeNode | null
}

function countComponents(node: ComponentTreeNode): number {
  let count = 1
  for (const child of node.children) {
    count += countComponents(child)
  }
  return count
}

function Card({ children, className = '', to }: { children: React.ReactNode, className?: string, to?: string }) {
  const navigate = useNavigate()
  const handleClick = () => {
    if (to) {
      navigate(to)
    }
  }

  return (
    <div
      className={`${className} min-h-[120px] flex flex-col items-center justify-center gap-2 border border-base rounded-lg bg-base p-4 shadow-sm ${to ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export function OverviewPage({ tree }: OverviewPageProps) {
  const componentCount = tree ? countComponents(tree) : 0
  const reactVersion = '18.3.1' // Mock version for now
  const [hookInstallAttempted, setHookInstallAttempted] = useState(false)

  // Install component tree hook when user first visits this page
  useEffect(() => {
    if (!hookInstallAttempted && !tree) {
      setHookInstallAttempted(true)

      // Request the overlay (parent window) to install the component tree hook
      // Since we're in an iframe, we need to send message to parent
      window.parent.postMessage({
        type: '__REACT_DEVTOOLS_INSTALL_COMPONENT_TREE_HOOK__',
      }, '*')

      console.log('[Overview Page] Requested component tree hook installation')
    }
  }, [hookInstallAttempted, tree])

  return (
    <div className="h-full w-full overflow-auto p-8 panel-grids">
      <div className="min-h-full flex flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <ReactLogo className="h-16 w-16 text-[#61DAFB]" />
            <h1 className="m-0 from-[#61DAFB] to-[#00b7ff] bg-gradient-to-r bg-clip-text text-5xl text-transparent font-bold">
              DevTools
            </h1>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">
              React DevTools v
              {pkg.version}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 mb-8 max-w-4xl w-full gap-4 md:grid-cols-3 sm:grid-cols-2">
          <Card className="theme-card-primary">
            <ReactLogo className="mb-1 h-8 w-8 text-#00b7ff" />
            <span className="text-xl text-#00b7ff font-bold">
              v
              {reactVersion}
            </span>
          </Card>
          <Card className="theme-card-primary" to="/components">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-1 h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
            </svg>
            <span className="flex items-center gap-1 text-primary-500">
              <span className="text-xl font-bold">{componentCount}</span>
              <span className="text-sm">Components</span>
            </span>
          </Card>
          <Card className="theme-card-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-1 h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span className="flex items-center gap-1 text-primary-500">
              <span className="text-xl font-bold">1</span>
              <span className="text-sm">Pages</span>
            </span>
          </Card>
        </div>

        <div className="flex flex-col gap-4 text-center text-gray-500 dark:text-gray-400">
          <div className="flex justify-center gap-6 text-sm">
            <a href="https://github.com/facebook/react/tree/main/packages/react-devtools" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-500">
              Star on GitHub
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-500">
              Documentation
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 border border-base rounded bg-white px-4 py-2 text-xs shadow-sm dark:bg-[#1a1a1a]">
            <span>Press</span>
            <kbd className="border border-gray-200 rounded bg-gray-50 px-1.5 py-0.5 font-sans dark:border-gray-700 dark:bg-gray-800">⇧ Shift</kbd>
            <span>+</span>
            <kbd className="border border-gray-200 rounded bg-gray-50 px-1.5 py-0.5 font-sans dark:border-gray-700 dark:bg-gray-800">⌥ Option</kbd>
            <span>+</span>
            <kbd className="border border-gray-200 rounded bg-gray-50 px-1.5 py-0.5 font-sans dark:border-gray-700 dark:bg-gray-800">D</kbd>
            <span>to toggle DevTools</span>
          </div>
        </div>
      </div>
    </div>
  )
}
